using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.Permissions;
using LinkDev.MOS.SuperApp.Business.Interfaces.QuickLinks;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Constants;
using LinkDev.MOS.SuperApp.Domain.Entities.QuickLinks;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.QuickLinks
{
    public class QuickLinkService : IQuickLinkService
    {
        private readonly IQuickLinkRepository _quickLinkRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;
        private readonly ICurrentUser _currentUser;
        private readonly IPermissionService _permissionService;

        public QuickLinkService(
            IQuickLinkRepository quickLinkRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService,
            ICurrentUser currentUser,
            IPermissionService permissionService)
        {
            _quickLinkRepo = quickLinkRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
            _currentUser = currentUser;
            _permissionService = permissionService;
        }

        public async Task<IEnumerable<QuickLinkDto>> GetAllAsync()
        {
            var links = await _quickLinkRepo.GetAllOrderedAsync();
            return _mapper.Map<IEnumerable<QuickLinkDto>>(links);
        }

        public async Task<IEnumerable<LinkedServiceDto>> GetAvailableServicesAsync()
        {
            var services = await _quickLinkRepo.GetAvailableServicesAsync();
            return _mapper.Map<IEnumerable<LinkedServiceDto>>(services);
        }

        public async Task<IEnumerable<QuickLinkDto>> SaveAsync(SaveQuickLinksDto dto)
        {
            var submittedServiceIds = (dto.Links ?? []).Select(l => l.ServiceId).ToList();

            await ValidateSubmittedServicesAsync(submittedServiceIds);

            var allLinks = (await _quickLinkRepo.GetAllIncludingDeletedAsync()).ToList();
            var activeLinks = allLinks.Where(q => !q.IsDeleted).ToList();

            EnsureUserHasPermissions(submittedServiceIds, activeLinks);
            await ApplyReplaceAllAsync(submittedServiceIds, allLinks);

            await _unitOfWork.SaveChangesAsync();
            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.QuickLinks,
                "Quick Links");

            var saved = await _quickLinkRepo.GetAllOrderedAsync();
            return _mapper.Map<IEnumerable<QuickLinkDto>>(saved);
        }

        private async Task ValidateSubmittedServicesAsync(IReadOnlyList<int> submittedServiceIds)
        {
            var linkedServices = (await _quickLinkRepo.GetLinkedServicesByIdsAsync(submittedServiceIds)).ToList();

            foreach (var serviceId in submittedServiceIds)
            {
                var linkedService = linkedServices.FirstOrDefault(s => s.Id == serviceId);
                if (linkedService == null || !linkedService.IsActive)
                {
                    throw new InvalidOperationException("The selected service was not found or is not available.");
                }

                if (string.IsNullOrWhiteSpace(linkedService.DeepLink))
                {
                    throw new InvalidOperationException("Every service must have a valid deep link before it can be saved as a quick link.");
                }
            }
        }

        private void EnsureUserHasPermissions(
            IReadOnlyList<int> submittedServiceIds,
            IReadOnlyList<QuickLink> activeLinks)
        {
            var activeIds = activeLinks.Select(q => q.ServiceId).ToHashSet();
            var submittedSet = submittedServiceIds.ToHashSet();

            var hasAdditions = submittedServiceIds.Any(id => !activeIds.Contains(id));
            var hasRemovals = activeLinks.Any(q => !submittedSet.Contains(q.ServiceId));

            var keptOldOrder = activeLinks
                .Where(q => submittedSet.Contains(q.ServiceId))
                .OrderBy(q => q.DisplayOrder)
                .Select(q => q.ServiceId);
            var keptSubmittedOrder = submittedServiceIds.Where(activeIds.Contains);
            var hasReorder = !keptOldOrder.SequenceEqual(keptSubmittedOrder);

            var isSuperAdmin = _currentUser.IsInRole(AppRoles.SuperAdmin);
            var userId = _currentUser.UserId ?? 0;

            if ((hasAdditions || hasReorder) &&
                !_permissionService.HasPermission(userId, isSuperAdmin, FeatureType.QuickLinks, PermissionAction.Add) &&
                !_permissionService.HasPermission(userId, isSuperAdmin, FeatureType.QuickLinks, PermissionAction.Edit))
            {
                throw new InvalidOperationException("You do not have permission to add or reorder quick links.");
            }

            if (hasRemovals &&
                !_permissionService.HasPermission(userId, isSuperAdmin, FeatureType.QuickLinks, PermissionAction.Delete))
            {
                throw new InvalidOperationException("You do not have permission to delete quick links.");
            }
        }

        private async Task ApplyReplaceAllAsync(
            IReadOnlyList<int> submittedServiceIds,
            List<QuickLink> allLinks)
        {
            var submittedSet = submittedServiceIds.ToHashSet();

            foreach (var toRemove in allLinks.Where(q => !q.IsDeleted && !submittedSet.Contains(q.ServiceId)))
            {
                toRemove.IsDeleted = true;
                _quickLinkRepo.Update(toRemove);
            }

            for (var i = 0; i < submittedServiceIds.Count; i++)
            {
                var serviceId = submittedServiceIds[i];
                var displayOrder = i + 1;
                var existing = allLinks.FirstOrDefault(q => q.ServiceId == serviceId);

                if (existing != null)
                {
                    existing.IsDeleted = false;
                    existing.DisplayOrder = displayOrder;
                    _quickLinkRepo.Update(existing);
                }
                else
                {
                    var created = new QuickLink
                    {
                        ServiceId = serviceId,
                        DisplayOrder = displayOrder
                    };
                    await _quickLinkRepo.AddAsync(created);
                    allLinks.Add(created);
                }
            }
        }
    }
}
