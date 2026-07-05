using Linkdev.MOS.SuperApp.Business.Interfaces.Authentication;
using LinkDev.MOS.SuperApp.Identity.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LinkDev.MOS.SuperApp.Identity.Services.Authentication
{
    public class JwtService : IJwtService
    {
        private readonly JwtOptions _jwtOptions;

        public JwtService(IOptions<JwtOptions> jwtOptions)
        {
            _jwtOptions = jwtOptions.Value;
        }
        public string GenerateAccessToken(int userId, string email, string fullName, List<string> roles)
        {
            // 1. set Claims
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Name, fullName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            // 2. add roles
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // 3. create key & credentials
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 4. set expiry date
            var expires = DateTime.UtcNow.AddMinutes(_jwtOptions.ExpiryInMinutes);

            // 5. generate token descriptor
            var tokenDescriptor = new JwtSecurityToken
            (
                issuer: _jwtOptions.Issuer,
                audience: _jwtOptions.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: credentials
            );

            // 6. return token
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
    }
}
