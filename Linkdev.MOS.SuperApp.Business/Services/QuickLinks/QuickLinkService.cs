using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.QuickLinks;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
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

        public QuickLinkService(
            IQuickLinkRepository quickLinkRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _quickLinkRepo = quickLinkRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
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
            var submitted = dto.Links ?? new List<QuickLinkItemDto>();
            var submittedServiceIds = submitted.Select(l => l.ServiceId).ToList();

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

            var existingLinks = (await _quickLinkRepo.GetAllIncludingDeletedAsync()).ToList();
            var submittedSet = submittedServiceIds.ToHashSet();

            foreach (var existing in existingLinks.Where(q => !q.IsDeleted && !submittedSet.Contains(q.ServiceId)))
            {
                existing.IsDeleted = true;
                _quickLinkRepo.Update(existing);
            }

            for (var i = 0; i < submittedServiceIds.Count; i++)
            {
                var serviceId = submittedServiceIds[i];
                var displayOrder = i + 1;
                var existing = existingLinks.FirstOrDefault(q => q.ServiceId == serviceId);

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
                    existingLinks.Add(created);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.QuickLinks,
                "Quick Links");

            var saved = await _quickLinkRepo.GetAllOrderedAsync();
            return _mapper.Map<IEnumerable<QuickLinkDto>>(saved);
        }
    }
}
