using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Identity.Entites;
using Linkdev.MOS.SuperApp.Business.Interfaces.Services.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.Identity.Services
{
    public class UserAccountService : IUserAccountService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;

        public UserAccountService(UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserAccountDto>> GetAllAccountsAsync(string? search)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u => u.FullName != null && u.FullName.ToLower().Contains(searchLower) ||
                                         u.Email != null && u.Email.ToLower().Contains(searchLower));
            }

            var users = await query.ToListAsync();
            return _mapper.Map<IEnumerable<UserAccountDto>>(users);
        }

        public async Task<UserAccountDto?> GetAccountByIdAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
            return user == null ? null : _mapper.Map<UserAccountDto>(user);
        }

        public async Task<UserAccountDto> CreateAccountAsync(string email, string fullName, string password, int staticUserId)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
            {
                throw new Exception("User already exists");
            }

            var user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                IsActive = true,
                StaticUserId = staticUserId
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User account creation failed: {errors}");
            }

            await _userManager.AddToRoleAsync(user, "Admin");
            return _mapper.Map<UserAccountDto>(user);
        }

        public async Task<bool> DeleteAccountAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        public async Task<UserAccountDto?> SuspendAccountAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return null;

            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User account suspension failed: {errors}");
            }

            return _mapper.Map<UserAccountDto>(user);
        }
    }
}
