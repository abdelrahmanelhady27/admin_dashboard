using Linkdev.MOS.SuperApp.Business.Entites;
using Linkdev.MOS.SuperApp.Business.Enums;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Interfaces
{
    public interface IPermissionService
    {
        bool HasPermission(ClaimsPrincipal user, FeatureType feature, PermissionAction action);
        Task<UserPermission> GetPermissionByIdAsync(int id);
        Task<IEnumerable<UserPermission>> GetAllPermissionsAsync();
        Task<IEnumerable<UserPermission>> GetPermissionsByUserIdAsync(int userId);
        Task CreatePermissionAsync(UserPermission permission);
        Task UpdatePermissionAsync(UserPermission permission);
        Task DeletePermissionAsync(int id);
    }
}
