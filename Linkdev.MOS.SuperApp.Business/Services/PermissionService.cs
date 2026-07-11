using Linkdev.MOS.SuperApp.Business.Entites;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserPermissionRepository _repo;
        private readonly IUnitOfWork _unitOfWork;

        public PermissionService(IUserPermissionRepository repo, IUnitOfWork unitOfWork)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
        }

        public bool HasPermission(ClaimsPrincipal user, FeatureType feature, PermissionAction action)
        {
            if(user.IsInRole("SuperAdmin"))
            {
                return true;
            }
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return false;
            }
            var permissions = _repo.GetAllByUserId(userId);

            return permissions.Any(p => p.Feature == feature && p.Permission.HasFlag(action));
        }

        public async Task<UserPermission> GetPermissionByIdAsync(int id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<IEnumerable<UserPermission>> GetAllPermissionsAsync()
        {
            return await _repo.GetAllAsync();
        }

        public async Task<IEnumerable<UserPermission>> GetPermissionsByUserIdAsync(int userId)
        {
            return _repo.GetAllByUserId(userId);
        }

        public async Task CreatePermissionAsync(UserPermission permission)
        {
            await _repo.AddAsync(permission);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task UpdatePermissionAsync(UserPermission permission)
        {
            _repo.Update(permission);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeletePermissionAsync(int id)
        {
            await _repo.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
