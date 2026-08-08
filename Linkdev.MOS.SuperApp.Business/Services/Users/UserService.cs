using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.Authentication;
using LinkDev.MOS.SuperApp.Business.Interfaces.Users;
using LinkDev.MOS.SuperApp.Business.Mapping;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Entities.Permission;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.Users
{
    public class UserService : IUserService
    {
        private readonly IUserAccountService _userAccountService;
        private readonly IUserPermissionRepository _permissionRepo;
        private readonly IStaticUserRepository _staticUserRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public UserService(
            IUserAccountService userAccountService,
            IUserPermissionRepository permissionRepo,
            IStaticUserRepository staticUserRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _userAccountService = userAccountService;
            _permissionRepo = permissionRepo;
            _staticUserRepo = staticUserRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<UserDto>> GetAllUsersAsync(UserSearchDto request)
        {
            var accounts = (await _userAccountService.GetAllAccountsAsync(request.Search, request.Status)).ToList();

            if (!string.IsNullOrWhiteSpace(request.ContentType) &&
                Enum.TryParse<FeatureType>(request.ContentType, true, out var filterFeat))
            {
                var userIdsWithFeature = await _permissionRepo.GetUserIdsWithFeatureReadAsync(filterFeat);
                var allowedIds = userIdsWithFeature.ToHashSet();
                accounts = accounts.Where(a => allowedIds.Contains(a.Id)).ToList();
            }

            accounts = ApplySort(accounts, request.SortBy, request.SortDescending);

            var totalCount = accounts.Count;
            var pageAccounts = accounts
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var dtos = new List<UserDto>(pageAccounts.Count);
            foreach (var acc in pageAccounts)
            {
                var userPermissions = _permissionRepo.GetAllByUserId(acc.Id).ToList();
                dtos.Add(_mapper.Map<UserDto>(new UserMappingModel { Account = acc, Permissions = userPermissions }));
            }

            return new PagedResult<UserDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }

        private static List<UserAccountDto> ApplySort(
            List<UserAccountDto> accounts,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "fullname" => sortDescending
                    ? accounts.OrderByDescending(a => a.FullName).ToList()
                    : accounts.OrderBy(a => a.FullName).ToList(),
                "email" => sortDescending
                    ? accounts.OrderByDescending(a => a.Email).ToList()
                    : accounts.OrderBy(a => a.Email).ToList(),
                "modifiedat" => sortDescending
                    ? accounts.OrderByDescending(a => a.ModifiedAt ?? a.CreatedAt).ToList()
                    : accounts.OrderBy(a => a.ModifiedAt ?? a.CreatedAt).ToList(),
                "createdat" => sortDescending
                    ? accounts.OrderByDescending(a => a.CreatedAt).ToList()
                    : accounts.OrderBy(a => a.CreatedAt).ToList(),
                _ => sortDescending
                    ? accounts.OrderByDescending(a => a.CreatedAt).ToList()
                    : accounts.OrderBy(a => a.CreatedAt).ToList()
            };
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

            var acc = await _userAccountService.CreateAccountAsync(
                createUserDto.Email,
                createUserDto.FullName,
                createUserDto.Password,
                createUserDto.StaticUserId);

            await SavePermissionsAsync(acc.Id, createUserDto.Permissions);

            await _unitOfWork.SaveChangesAsync();

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

            await SavePermissionsAsync(id, permissions);

            var updatedAcc = await _userAccountService.TouchAccountAsync(id) ?? acc;

            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.User,
                updatedAcc.FullName ?? updatedAcc.Email ?? id.ToString(),
                id);

            var userDto = _mapper.Map<UserDto>(updatedAcc);
            userDto.Permissions = permissions;
            return userDto;
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            var acc = await _userAccountService.GetAccountByIdAsync(id);
            if (acc == null) return false;

            var entityName = acc.FullName ?? acc.Email ?? id.ToString();

            var success = await _userAccountService.DeleteAccountAsync(id);
            if (!success) return false;

            var existing = _permissionRepo.GetAllByUserId(id).ToList();
            foreach (var p in existing)
            {
                await _permissionRepo.DeleteAsync(p.Id);
            }
            await _unitOfWork.SaveChangesAsync();

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
            var staticUsers = await _staticUserRepo.SearchUnregisteredAsync(term);
            return _mapper.Map<IEnumerable<StaticUserDto>>(staticUsers);
        }

        private async Task SavePermissionsAsync(int userId, List<PermissionSetDto> permissions)
        {
            var existing = _permissionRepo.GetAllByUserId(userId).ToList();
            foreach (var p in existing)
            {
                await _permissionRepo.DeleteAsync(p.Id);
            }

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
