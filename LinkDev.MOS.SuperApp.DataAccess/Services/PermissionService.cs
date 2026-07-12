using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.UserPermission;
using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using Linkdev.MOS.SuperApp.Business.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Services
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
