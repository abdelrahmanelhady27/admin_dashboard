using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using LinkDev.MOS.SuperApp.Business.Interfaces.Authentication;
using LinkDev.MOS.SuperApp.Domain.Constants;
using Linkdev.MOS.SuperApp.Identity.Entites;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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

        public async Task<IEnumerable<UserAccountDto>> GetAllAccountsAsync(string? search, string? status = null)
        {
            var query = _userManager.Users.Where(u => !u.IsDeleted);

            if (!string.IsNullOrEmpty(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u =>
                    (u.FullName != null && u.FullName.ToLower().Contains(searchLower)) ||
                    (u.Email != null && u.Email.ToLower().Contains(searchLower)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(u => u.IsActive);
                }
                else if (status.Equals("Suspended", StringComparison.OrdinalIgnoreCase)
                      || status.Equals("Inactive", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(u => !u.IsActive);
                }
            }

            var users = await query.ToListAsync();
            return _mapper.Map<IEnumerable<UserAccountDto>>(users);
        }

        public async Task<UserAccountDto?> GetAccountByIdAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            return user == null ? null : _mapper.Map<UserAccountDto>(user);
        }

        public async Task<UserAccountDto> CreateAccountAsync(string email, string fullName, string password, int staticUserId)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);

            if (existingUser != null && !existingUser.IsDeleted)
            {
                throw new Exception("The user has already been added");
            }

            if (existingUser != null && existingUser.IsDeleted)
            {
                return await RestoreAccountAsync(existingUser, fullName, password, staticUserId);
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

            await _userManager.AddToRoleAsync(user, AppRoles.Admin);
            return _mapper.Map<UserAccountDto>(user);
        }

        private async Task<UserAccountDto> RestoreAccountAsync(
            ApplicationUser existingUser,
            string fullName,
            string password,
            int staticUserId)
        {
            existingUser.FullName = fullName;
            existingUser.StaticUserId = staticUserId;
            existingUser.IsDeleted = false;
            existingUser.IsActive = true;

            // Replace password so the admin sets a fresh credential on re-add.
            await _userManager.RemovePasswordAsync(existingUser);
            var addPwdResult = await _userManager.AddPasswordAsync(existingUser, password);
            if (!addPwdResult.Succeeded)
            {
                var errors = string.Join(", ", addPwdResult.Errors.Select(e => e.Description));
                throw new Exception($"User account restore failed: {errors}");
            }

            var updateResult = await _userManager.UpdateAsync(existingUser);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
                throw new Exception($"User account restore failed: {errors}");
            }

            if (!await _userManager.IsInRoleAsync(existingUser, AppRoles.Admin))
            {
                await _userManager.AddToRoleAsync(existingUser, AppRoles.Admin);
            }

            return _mapper.Map<UserAccountDto>(existingUser);
        }

        public async Task<bool> DeleteAccountAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null) return false;

            user.IsDeleted = true;
            user.IsActive = false;
            var result = await _userManager.UpdateAsync(user);
            return result.Succeeded;
        }

        public async Task<UserAccountDto?> SuspendAccountAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
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

        public async Task<UserAccountDto?> ActivateAccountAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null) return null;

            user.IsActive = true;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User account activation failed: {errors}");
            }

            return _mapper.Map<UserAccountDto>(user);
        }

        public async Task<UserAccountDto?> TouchAccountAsync(int id)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
            if (user == null) return null;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User account touch failed: {errors}");
            }

            return _mapper.Map<UserAccountDto>(user);
        }
    }
}
