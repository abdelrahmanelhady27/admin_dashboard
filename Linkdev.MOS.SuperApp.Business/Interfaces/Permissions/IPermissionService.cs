using Linkdev.MOS.SuperApp.Business.Dtos;
using Linkdev.MOS.SuperApp.Business.DTOs.UserPermission;
using Linkdev.MOS.SuperApp.Business.Enums;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Permissions
{
    public interface IPermissionService
    {
        bool HasPermission(ClaimsPrincipal user, FeatureType feature, PermissionAction action);
        Task<UserPermissionDto?> GetPermissionByIdAsync(int id);
        Task<IEnumerable<UserPermissionDto>> GetAllPermissionsAsync();
        Task<IEnumerable<UserPermissionDto>> GetPermissionsByUserIdAsync(int userId);
        Task CreatePermissionAsync(UserPermissionDto permissionDto);
        Task UpdatePermissionAsync(UserPermissionDto permissionDto);
        Task DeletePermissionAsync(int id);
    }
}
