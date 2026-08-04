using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.QuickLinks;
using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.AuditLog;
using Linkdev.MOS.SuperApp.Business.Interfaces.QuickLinks;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.Entites.QuickLinks;
using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Services
{
    public class QuickLinkService : IQuickLinkService
    {
        private readonly IQuickLinkRepository _quickLinkRepo;
        private readonly IQueryableRepository<LinkedService> _linkedServicesRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public QuickLinkService(
            IQuickLinkRepository quickLinkRepo,
            IQueryableRepository<LinkedService> linkedServicesRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _quickLinkRepo = quickLinkRepo;
            _linkedServicesRepo = linkedServicesRepo;
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
            var existingServiceIds = (await _quickLinkRepo.GetAllOrderedAsync())
                .Select(q => q.ServiceId)
                .ToHashSet();

            var services = await _linkedServicesRepo.GetQueryable()
                .AsNoTracking()
                .Include(s => s.System)
                .Where(s => !s.IsDeleted
                    && s.IsActive
                    && !string.IsNullOrEmpty(s.DeepLink)
                    && !existingServiceIds.Contains(s.Id))
                .OrderBy(s => s.SystemId)
                .ThenBy(s => s.NameEn)
                .ToListAsync();

            return _mapper.Map<IEnumerable<LinkedServiceDto>>(services);
        }

        public async Task<IEnumerable<QuickLinkDto>> SaveAsync(SaveQuickLinksDto dto)
        {
            var submitted = dto.Links ?? new List<QuickLinkItemDto>();
            var submittedServiceIds = submitted.Select(l => l.ServiceId).ToList();

            var linkedServices = await _linkedServicesRepo.GetQueryable()
                .Where(s => submittedServiceIds.Contains(s.Id) && !s.IsDeleted)
                .ToListAsync();

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
