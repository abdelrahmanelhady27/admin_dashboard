using Linkdev.MOS.SuperApp.Business.Dtos.Authentication;
using Linkdev.MOS.SuperApp.Business.Interfaces.Authentication;
using LinkDev.MOS.SuperApp.Identity.DbContexts;
using LinkDev.MOS.SuperApp.Identity.Entities;
using LinkDev.MOS.SuperApp.Identity.Options;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Identity.Services.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly IJwtService _jwtService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<ApplicationRole> roleManager,
            IJwtService jwtService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
        }
        public async Task<AuthResponseDto> LoginAsync(LoginRequestDto LogDto)
        {
            // 1. find user by email
            var user = await _userManager.FindByEmailAsync(LogDto.Email);
            if (user == null || !user.IsActive)
            {
                throw new Exception("Invalid email or password.");
            }

            // 2. validate pass
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, LogDto.Password);
            if(!isPasswordValid)
            {
                throw new Exception("Invalid email or password.");
            }

            // 3. get user roles
            var roles = await _userManager.GetRolesAsync(user);

            // 4. generate token
            var token = _jwtService.GenerateAccessToken(
                user.Id,
                user.Email,
                user.FullName ?? "",
                roles.ToList());

            // 5. return response
            return new AuthResponseDto
            {
                Email = user.Email,
                FullName = user.FullName ?? "",
                Token = token,
            };
        }
        public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto RegDto)
        {
            // 1. check if user exists
            var existingUser = await _userManager.FindByEmailAsync(RegDto.Email);
            if(existingUser != null)
            {
                throw new Exception("User already exists");
            }

            // 2. create user
            var user = new ApplicationUser
            {
                UserName = RegDto.Email,
                Email = RegDto.Email,
                FullName = RegDto.FullName,
                IsActive = true
            };

            // 3. register user in db
            var res = await _userManager.CreateAsync(user, RegDto.Password);
            if (!res.Succeeded)
            {
                throw new Exception("User registration failed");
            }

            // 4. assign admin role to the created user
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = "Admin" });
            }
            await _userManager.AddToRoleAsync(user, "Admin");

            // 4. generate token
            var token = _jwtService.GenerateAccessToken(
                user.Id,
                user.Email,
                user.FullName ?? "",
                new List<string> { "Admin" });

            // 5. return response
            return new AuthResponseDto
            {
                Email = user.Email,
                FullName = user.FullName ?? "",
                Token = token,
            };
        }

        public Task LogoutAsync(int userId)
        {
            throw new NotImplementedException();
        }

    }
}
