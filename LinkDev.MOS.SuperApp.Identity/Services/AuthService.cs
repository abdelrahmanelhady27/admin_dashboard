using LinkDev.MOS.SuperApp.Business.Dtos.Authentication;
using LinkDev.MOS.SuperApp.Business.Interfaces.Authentication;
using Linkdev.MOS.SuperApp.Identity.Entites;
using LinkDev.MOS.SuperApp.Domain.Constants;
using LinkDev.MOS.SuperApp.Identity.DbContexts;
using LinkDev.MOS.SuperApp.Identity.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace LinkDev.MOS.SuperApp.Identity.Services.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IJwtService _jwtService;
        private readonly AppIdentityDbContext _dbContext;
        private readonly JwtOptions _jwtOptions;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IJwtService jwtService,
            AppIdentityDbContext dbContext,
            IOptions<JwtOptions> jwtOptions)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _dbContext = dbContext;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto LogDto)
        {
            var user = await _userManager.FindByEmailAsync(LogDto.Email);
            if (user == null || !user.IsActive || user.IsDeleted)
            {
                throw new Exception("Invalid email or password.");
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, LogDto.Password);
            if (!isPasswordValid)
            {
                throw new Exception("Invalid email or password.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            return await CreateAuthResponseAsync(user, roles.ToList());
        }

        public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto RegDto)
        {
            var existingUser = await _userManager.FindByEmailAsync(RegDto.Email);
            if (existingUser != null)
            {
                throw new Exception("User already exists");
            }

            var user = new ApplicationUser
            {
                UserName = RegDto.Email,
                Email = RegDto.Email,
                FullName = RegDto.FullName,
                IsActive = true
            };

            var res = await _userManager.CreateAsync(user, RegDto.Password);
            if (!res.Succeeded)
            {
                throw new Exception("User registration failed");
            }

            if (!await _roleManager.RoleExistsAsync(AppRoles.Admin))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = AppRoles.Admin });
            }
            await _userManager.AddToRoleAsync(user, AppRoles.Admin);

            return new RegisterResponseDto
            {
                FullName = user.FullName ?? "",
                Email = user.Email,
                Role = AppRoles.Admin
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
        {
            var tokenHash = HashToken(dto.RefreshToken);
            var storedToken = await _dbContext.RefreshTokens
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

            if (storedToken == null)
            {
                throw new Exception("Invalid refresh token.");
            }

            if (storedToken.IsRevoked)
            {
                await RevokeAllUserTokensAsync(storedToken.UserId);
                throw new Exception("Invalid refresh token.");
            }

            if (storedToken.IsExpired)
            {
                throw new Exception("Invalid refresh token.");
            }

            var user = storedToken.User;
            if (user == null || !user.IsActive || user.IsDeleted)
            {
                throw new Exception("Invalid refresh token.");
            }

            var refreshToken = _jwtService.GenerateRefreshToken();
            var newTokenHash = HashToken(refreshToken);

            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.ReplacedByTokenHash = newTokenHash;

            _dbContext.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = newTokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiryInDays)
            });

            await _dbContext.SaveChangesAsync();

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _jwtService.GenerateAccessToken(
                user.Id,
                user.Email!,
                user.FullName ?? "",
                roles.ToList());

            return new AuthResponseDto
            {
                Email = user.Email!,
                FullName = user.FullName ?? "",
                Token = accessToken,
                RefreshToken = refreshToken
            };
        }

        public async Task LogoutAsync(RefreshTokenRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RefreshToken))
            {
                return;
            }

            var tokenHash = HashToken(dto.RefreshToken);
            var storedToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

            if (storedToken == null || !storedToken.IsActive)
            {
                return;
            }

            storedToken.RevokedAt = DateTime.UtcNow;
            await _dbContext.SaveChangesAsync();
        }

        private async Task<AuthResponseDto> CreateAuthResponseAsync(ApplicationUser user, List<string> roles)
        {
            var accessToken = _jwtService.GenerateAccessToken(
                user.Id,
                user.Email!,
                user.FullName ?? "",
                roles);

            var refreshToken = _jwtService.GenerateRefreshToken();
            var tokenHash = HashToken(refreshToken);

            _dbContext.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                TokenHash = tokenHash,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiryInDays)
            });

            await _dbContext.SaveChangesAsync();

            return new AuthResponseDto
            {
                Email = user.Email!,
                FullName = user.FullName ?? "",
                Token = accessToken,
                RefreshToken = refreshToken
            };
        }

        private async Task RevokeAllUserTokensAsync(int userId)
        {
            var activeTokens = await _dbContext.RefreshTokens
                .Where(x => x.UserId == userId && x.RevokedAt == null && x.ExpiresAt > DateTime.UtcNow)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
            }

            await _dbContext.SaveChangesAsync();
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }
    }
}
