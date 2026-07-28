using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.DataAccess.Mapping;
using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.Entites;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Linkdev.MOS.SuperApp.Business.Interfaces.Authentication;
using Linkdev.MOS.SuperApp.Business.Interfaces.Users;
using Linkdev.MOS.SuperApp.Business.Interfaces.AuditLog;

namespace Linkdev.MOS.SuperApp.Business.Services
{
    public class UserService : IUserService
    {
        private readonly IUserAccountService _userAccountService;
        private readonly IUserPermissionRepository _permissionRepo;
        private readonly IQueryableRepository<StaticUser> _staticUserRepo;
        private readonly IQueryableRepository<UnregisteredStaticUser> _unregisteredStaticUserRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public UserService(
            IUserAccountService userAccountService,
            IUserPermissionRepository permissionRepo,
            IQueryableRepository<StaticUser> staticUserRepo,
            IQueryableRepository<UnregisteredStaticUser> unregisteredStaticUserRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _userAccountService = userAccountService;
            _permissionRepo = permissionRepo;
            _staticUserRepo = staticUserRepo;
            _unregisteredStaticUserRepo = unregisteredStaticUserRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync(string? search, string? status, string? feature)
        {
            var accounts = await _userAccountService.GetAllAccountsAsync(search);
            var dtos = new List<UserDto>();

            foreach (var acc in accounts)
            {
                var userPermissions = _permissionRepo.GetAllByUserId(acc.Id).ToList();
                var dto = _mapper.Map<UserDto>(new UserMappingModel { Account = acc, Permissions = userPermissions });

                // Filter by status
                if (!string.IsNullOrEmpty(status) && !dto.Status.Equals(status, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                // Filter by feature permission
                if (!string.IsNullOrEmpty(feature) && Enum.TryParse<FeatureType>(feature, true, out var filterFeat))
                {
                    var hasPerm = dto.Permissions.Any(p => p.Feature == filterFeat && p.CanView);
                    if (!hasPerm) continue;
                }

                dtos.Add(dto);
            }

            return dtos;
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var acc = await _userAccountService.GetAccountByIdAsync(id);
            if (acc == null) return null;

            var userPermissions = _permissionRepo.GetAllByUserId(id).ToList();
            return _mapper.Map<UserDto>(new UserMappingModel { Account = acc, Permissions = userPermissions });
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            var staticUser = await _staticUserRepo.GetByIdAsync(createUserDto.StaticUserId);
            if (staticUser == null || staticUser.IsDeleted)
            {
                throw new InvalidOperationException("The selected user was not found in the ministry account.");
            }

            if (!staticUser.IsActive)
            {
                throw new InvalidOperationException("An inactive user cannot be added");
            }

            // Create user account via Identity Service
            var acc = await _userAccountService.CreateAccountAsync(
                createUserDto.Email,
                createUserDto.FullName,
                createUserDto.Password,
                createUserDto.StaticUserId);

            // Save permissions using repository
            await SavePermissionsAsync(acc.Id, createUserDto.Permissions);

            // Delete from static users since they are now a dashboard user
            await _unitOfWork.SaveChangesAsync();

            // Log audit
            await _auditLogService.LogAsync(
                AuditActionType.Create,
                AuditEntityType.User,
                createUserDto.FullName,
                acc.Id);

            var userDto = _mapper.Map<UserDto>(acc);
            userDto.Permissions = createUserDto.Permissions;
            return userDto;
        }

        public async Task<UserDto?> UpdateUserPermissionsAsync(int id, List<PermissionSetDto> permissions)
        {
            var acc = await _userAccountService.GetAccountByIdAsync(id);
            if (acc == null) return null;

            // Save permissions using repository
            await SavePermissionsAsync(id, permissions);

            // Log audit
            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.User,
                acc.FullName ?? acc.Email ?? id.ToString(),
                id);

            var userDto = _mapper.Map<UserDto>(acc);
            userDto.Permissions = permissions;
            return userDto;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var acc = await _userAccountService.GetAccountByIdAsync(id);
            if (acc == null) return false;

            var entityName = acc.FullName ?? acc.Email ?? id.ToString();

            // 1. Delete account
            var success = await _userAccountService.DeleteAccountAsync(id);
            if (!success) return false;

            // 2. Delete permissions
            var existing = _permissionRepo.GetAllByUserId(id).ToList();
            foreach (var p in existing)
            {
                await _permissionRepo.DeleteAsync(p.Id);
            }
            await _unitOfWork.SaveChangesAsync();

            // Log audit
            await _auditLogService.LogAsync(
                AuditActionType.Delete,
                AuditEntityType.User,
                entityName,
                id);

            return true;
        }

        public async Task<UserDto?> SuspendUserAsync(int id)
        {
            var acc = await _userAccountService.SuspendAccountAsync(id);
            if (acc == null) return null;

            // Log audit
            await _auditLogService.LogAsync(
                AuditActionType.Suspend,
                AuditEntityType.User,
                acc.FullName ?? acc.Email ?? id.ToString(),
                id);

            var userPermissions = _permissionRepo.GetAllByUserId(id).ToList();
            return _mapper.Map<UserDto>(new UserMappingModel { Account = acc, Permissions = userPermissions });
        }

        public async Task<UserDto?> ActivateUserAsync(int id)
        {
            var acc = await _userAccountService.ActivateAccountAsync(id);
            if (acc == null) return null;

            // Log audit
            await _auditLogService.LogAsync(
                AuditActionType.Activate,
                AuditEntityType.User,
                acc.FullName ?? acc.Email ?? id.ToString(),
                id);

            var userPermissions = _permissionRepo.GetAllByUserId(id).ToList();
            return _mapper.Map<UserDto>(new UserMappingModel { Account = acc, Permissions = userPermissions });
        }

        public async Task<IEnumerable<StaticUserDto>> SearchStaticUsersAsync(string term)
        {
            var termLower = term.ToLower();
            var query = _unregisteredStaticUserRepo.GetQueryable();
            var staticUsers = query.Where(u => u.FullName.ToLower().Contains(termLower) || u.Email.ToLower().Contains(termLower)).ToList();

            return _mapper.Map<IEnumerable<StaticUserDto>>(staticUsers);
        }


        private async Task SavePermissionsAsync(int userId, List<PermissionSetDto> permissions)
        {
            var existing = _permissionRepo.GetAllByUserId(userId).ToList();
            foreach (var p in existing)
            {
                await _permissionRepo.DeleteAsync(p.Id);
            }

            // Group by Feature and merge permission flags to prevent duplicates
            var uniquePermissions = permissions
                .GroupBy(p => p.Feature)
                .Select(g => new PermissionSetDto
                {
                    Feature = g.Key,
                    CanView = g.Any(x => x.CanView),
                    CanCreate = g.Any(x => x.CanCreate),
                    CanEdit = g.Any(x => x.CanEdit),
                    CanDelete = g.Any(x => x.CanDelete),
                    CanPublish = g.Any(x => x.CanPublish)
                })
                .ToList();

            foreach (var perm in uniquePermissions)
            {
                var feature = perm.Feature;

                if (perm.CanView)
                    await _permissionRepo.AddAsync(new UserPermission { UserId = userId, Feature = feature, Permission = PermissionAction.Read });
                if (perm.CanCreate)
                    await _permissionRepo.AddAsync(new UserPermission { UserId = userId, Feature = feature, Permission = PermissionAction.Add });
                if (perm.CanEdit)
                    await _permissionRepo.AddAsync(new UserPermission { UserId = userId, Feature = feature, Permission = PermissionAction.Edit });
                if (perm.CanDelete)
                    await _permissionRepo.AddAsync(new UserPermission { UserId = userId, Feature = feature, Permission = PermissionAction.Delete });
                if (perm.CanPublish)
                    await _permissionRepo.AddAsync(new UserPermission { UserId = userId, Feature = feature, Permission = PermissionAction.Publish });
            }

            await _unitOfWork.SaveChangesAsync();
        }
    }
}
