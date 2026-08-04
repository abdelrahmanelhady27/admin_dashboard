using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.UserPermission;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.Permissions;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Entities.Permission;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.Permissions
{
    public class PermissionService : IPermissionService
    {
        private readonly IUserPermissionRepository _permissionRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PermissionService(IUserPermissionRepository permissionRepo, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _permissionRepo = permissionRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public bool HasPermission(int userId, bool isSuperAdmin, FeatureType feature, PermissionAction action)
        {
            if (isSuperAdmin)
            {
                return true;
            }

            var permissions = _permissionRepo.GetAllByUserId(userId);
            return permissions.Any(p => p.Feature == feature && p.Permission.HasFlag(action));
        }

        public async Task<UserPermissionDto?> GetPermissionByIdAsync(int id)
        {
            var entity = await _permissionRepo.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<UserPermissionDto>(entity);
        }

        public async Task<IEnumerable<UserPermissionDto>> GetAllPermissionsAsync()
        {
            var entities = await _permissionRepo.GetAllAsync();
            return _mapper.Map<IEnumerable<UserPermissionDto>>(entities);
        }

        public async Task<IEnumerable<UserPermissionDto>> GetPermissionsByUserIdAsync(int userId)
        {
            var entities = _permissionRepo.GetAllByUserId(userId);
            return _mapper.Map<IEnumerable<UserPermissionDto>>(entities);
        }

        public async Task CreatePermissionAsync(UserPermissionDto permissionDto)
        {
            var entity = _mapper.Map<UserPermission>(permissionDto);
            await _permissionRepo.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task UpdatePermissionAsync(UserPermissionDto permissionDto)
        {
            var entity = _mapper.Map<UserPermission>(permissionDto);
            _permissionRepo.Update(entity);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeletePermissionAsync(int id)
        {
            await _permissionRepo.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();
        }
    }
}
