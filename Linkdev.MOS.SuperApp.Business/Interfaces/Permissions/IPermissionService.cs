using LinkDev.MOS.SuperApp.Business.DTOs.UserPermission;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Permissions
{
    public interface IPermissionService
    {
        bool HasPermission(int userId, bool isSuperAdmin, FeatureType feature, PermissionAction action);
        Task<UserPermissionDto?> GetPermissionByIdAsync(int id);
        Task<IEnumerable<UserPermissionDto>> GetAllPermissionsAsync();
        Task<IEnumerable<UserPermissionDto>> GetPermissionsByUserIdAsync(int userId);
        Task CreatePermissionAsync(UserPermissionDto permissionDto);
        Task UpdatePermissionAsync(UserPermissionDto permissionDto);
        Task DeletePermissionAsync(int id);
    }
}
