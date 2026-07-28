using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.AuditLog;
using Linkdev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Services
{
    public class ServiceIntroPageService : IServiceIntroPageService
    {
        private static readonly JsonSerializerOptions SnapshotJsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        private readonly IServiceIntroPageRepository _pageRepo;
        private readonly IQueryableRepository<AvailableLinkedService> _availableServicesRepo;
        private readonly IQueryableRepository<LinkedService> _linkedServicesRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public ServiceIntroPageService(
            IServiceIntroPageRepository pageRepo,
            IQueryableRepository<AvailableLinkedService> availableServicesRepo,
            IQueryableRepository<LinkedService> linkedServicesRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _pageRepo = pageRepo;
            _availableServicesRepo = availableServicesRepo;
            _linkedServicesRepo = linkedServicesRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<IEnumerable<ServiceIntroPageDto>> GetAllAsync(string? search, string? status)
        {
            var pages = await _pageRepo.GetAllWithDetailsAsync(search, status);
            return pages.Select(MapToDto).ToList();
        }

        public async Task<ServiceIntroPageDto?> GetByIdAsync(int id)
        {
            var page = await _pageRepo.GetByIdWithDetailsAsync(id);
            return page == null ? null : MapToDto(page);
        }

        public async Task<IEnumerable<LinkedServiceDto>> GetAvailableServicesAsync()
        {
            var services = _availableServicesRepo.GetQueryable().ToList();
            return _mapper.Map<IEnumerable<LinkedServiceDto>>(services);
        }

        public async Task<ServiceIntroPageDto> CreateAsync(CreateServiceIntroPageDto dto)
        {
            var existing = await _pageRepo.GetByServiceIdAsync(dto.ServiceId);
            if (existing != null)
            {
                throw new InvalidOperationException("A details page cannot be created more than once for the same service");
            }

            var linkedService = _linkedServicesRepo.GetQueryable()
                .FirstOrDefault(s => s.Id == dto.ServiceId && !s.IsDeleted && s.IsActive);
            if (linkedService == null)
            {
                throw new InvalidOperationException("The selected service was not found or is not available.");
            }

            var page = new ServiceIntroPage
            {
                ServiceId = dto.ServiceId,
                Status = PageStatus.Draft,
                Description = dto.Description?.Trim() ?? "",
                ProcessingDuration = dto.ProcessingDuration?.Trim() ?? "",
                VideoUrl = dto.VideoUrl,
                VideoFileName = dto.VideoFileName,
                Documents = MapDocuments(dto.Documents),
                Faqs = MapFaqs(dto.Faqs)
            };

            await _pageRepo.AddAsync(page);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Create,
                AuditEntityType.ServiceIntroPage,
                linkedService.NameEn,
                page.Id);

            if (dto.Publish)
            {
                var published = await PublishAsync(page.Id);
                if (published != null)
                {
                    return published;
                }
            }

            var created = await _pageRepo.GetByIdWithDetailsAsync(page.Id);
            return MapToDto(created);
        }

        public async Task<ServiceIntroPageDto?> UpdateAsync(int id, UpdateServiceIntroPageDto dto)
        {
            var page = await _pageRepo.GetByIdWithDetailsAsync(id);
            if (page == null)
            {
                return null;
            }

            page.Description = dto.Description?.Trim() ?? "";
            page.ProcessingDuration = dto.ProcessingDuration?.Trim() ?? "";
            page.VideoUrl = dto.VideoUrl;
            page.VideoFileName = dto.VideoFileName;

            if (page.Status == PageStatus.Published || page.Status == PageStatus.Unpublished)
            {
                page.Status = PageStatus.Draft;
            }

            ReplaceDocuments(page, dto.Documents);
            ReplaceFaqs(page, dto.Faqs);

            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.ServiceIntroPage,
                page.Service?.NameEn ?? id.ToString(),
                id);

            var updated = await _pageRepo.GetByIdWithDetailsAsync(id);
            return MapToDto(updated);
        }

        public async Task<ServiceIntroPageDto?> PublishAsync(int id)
        {
            var page = await _pageRepo.GetByIdWithDetailsAsync(id);
            if (page == null)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(page.Description) || string.IsNullOrWhiteSpace(page.ProcessingDuration))
            {
                throw new InvalidOperationException("Please complete all mandatory fields before publishing");
            }

            page.Status = PageStatus.Published;
            page.PublishedAt = DateTime.UtcNow;
            page.PublishedSnapshotJson = JsonSerializer.Serialize(BuildSnapshot(page), SnapshotJsonOptions);

            _pageRepo.Update(page);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Publish,
                AuditEntityType.ServiceIntroPage,
                page.Service?.NameEn ?? id.ToString(),
                id);

            var published = await _pageRepo.GetByIdWithDetailsAsync(id);
            return MapToDto(published!);
        }

        public async Task<ServiceIntroPageDto?> UnpublishAsync(int id)
        {
            var page = await _pageRepo.GetByIdWithDetailsAsync(id);
            if (page == null)
            {
                return null;
            }

            page.Status = PageStatus.Unpublished;
            _pageRepo.Update(page);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Unpublish,
                AuditEntityType.ServiceIntroPage,
                page.Service?.NameEn ?? id.ToString(),
                id);

            var unpublished = await _pageRepo.GetByIdWithDetailsAsync(id);
            return MapToDto(unpublished!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var page = await _pageRepo.GetByIdWithDetailsAsync(id);
            if (page == null)
            {
                return false;
            }

            var entityName = page.Service?.NameEn ?? id.ToString();

            page.IsDeleted = true;
            _pageRepo.Update(page);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Delete,
                AuditEntityType.ServiceIntroPage,
                entityName,
                id);

            return true;
        }

        public async Task<ServiceIntroPageDto?> GetPublishedByServiceIdAsync(int serviceId)
        {
            var page = await _pageRepo.GetByServiceIdAsync(serviceId);
            if (page == null || page.Status == PageStatus.Unpublished || string.IsNullOrWhiteSpace(page.PublishedSnapshotJson))
            {
                return null;
            }

            var snapshot = JsonSerializer.Deserialize<PublishedSnapshot>(page.PublishedSnapshotJson, SnapshotJsonOptions);
            if (snapshot == null)
            {
                return null;
            }

            return new ServiceIntroPageDto
            {
                Id = page.Id,
                ServiceId = page.ServiceId,
                ServiceNameAr = page.Service?.NameAr ?? string.Empty,
                ServiceNameEn = page.Service?.NameEn ?? string.Empty,
                Status = PageStatus.Published.ToString(),
                Description = snapshot.Description,
                ProcessingDuration = snapshot.ProcessingDuration,
                VideoUrl = snapshot.VideoUrl,
                VideoFileName = snapshot.VideoFileName,
                Documents = snapshot.Documents ?? new List<ServiceDocumentDto>(),
                Faqs = snapshot.Faqs ?? new List<ServiceFaqDto>(),
                CreatedAt = page.CreatedAt,
                ModifiedAt = page.ModifiedAt,
                ModifiedBy = page.ModifiedBy,
                PublishedAt = page.PublishedAt
            };
        }

        private ServiceIntroPageDto MapToDto(ServiceIntroPage page)
        {
            var dto = _mapper.Map<ServiceIntroPageDto>(page);
            dto.ServiceNameAr = page.Service?.NameAr ?? "";
            dto.ServiceNameEn = page.Service?.NameEn ?? "";
            dto.Status = page.Status.ToString();
            dto.Documents = page.Documents?
                .Where(d => !d.IsDeleted)
                .Select(d => _mapper.Map<ServiceDocumentDto>(d))
                .ToList() ?? new List<ServiceDocumentDto>();
            dto.Faqs = page.Faqs?
                .Where(f => !f.IsDeleted)
                .Select(f => _mapper.Map<ServiceFaqDto>(f))
                .ToList() ?? new List<ServiceFaqDto>();
            return dto;
        }

        private static PublishedSnapshot BuildSnapshot(ServiceIntroPage page)
        {
            return new PublishedSnapshot
            {
                Description = page.Description,
                ProcessingDuration = page.ProcessingDuration,
                VideoUrl = page.VideoUrl,
                VideoFileName = page.VideoFileName,
                Documents = page.Documents?
                    .Where(d => !d.IsDeleted)
                    .Select(d => new ServiceDocumentDto
                    {
                        Id = d.Id,
                        Name = d.Name,
                        FileUrl = d.FileUrl,
                        FileName = d.FileName,
                        FileType = d.FileType
                    }).ToList() ?? new List<ServiceDocumentDto>(),
                Faqs = page.Faqs?
                    .Where(f => !f.IsDeleted)
                    .Select(f => new ServiceFaqDto
                    {
                        Id = f.Id,
                        Question = f.Question,
                        Answer = f.Answer
                    }).ToList() ?? new List<ServiceFaqDto>()
            };
        }

        private static List<ServiceDocument> MapDocuments(List<ServiceDocumentDto>? documents)
        {
            return (documents ?? new List<ServiceDocumentDto>())
                .Where(d => !string.IsNullOrWhiteSpace(d.Name))
                .Take(5)
                .Select(d => new ServiceDocument
                {
                    Name = d.Name.Trim(),
                    FileUrl = d.FileUrl,
                    FileName = d.FileName,
                    FileType = d.FileType
                }).ToList();
        }

        private static List<ServiceFaq> MapFaqs(List<ServiceFaqDto>? faqs)
        {
            return (faqs ?? new List<ServiceFaqDto>())
                .Where(f => !string.IsNullOrWhiteSpace(f.Question) && !string.IsNullOrWhiteSpace(f.Answer))
                .Take(10)
                .Select(f => new ServiceFaq
                {
                    Question = f.Question.Trim(),
                    Answer = f.Answer.Trim()
                }).ToList();
        }

        private static void ReplaceDocuments(ServiceIntroPage page, List<ServiceDocumentDto>? documents)
        {
            var incoming = (documents ?? new List<ServiceDocumentDto>())
                .Where(d => !string.IsNullOrWhiteSpace(d.Name))
                .Take(5)
                .ToList();

            var incomingIds = incoming.Where(d => d.Id > 0).Select(d => d.Id).ToHashSet();
            foreach (var existing in page.Documents.Where(d => !incomingIds.Contains(d.Id)).ToList())
            {
                page.Documents.Remove(existing);
            }

            foreach (var dto in incoming)
            {
                var existing = dto.Id > 0 ? page.Documents.FirstOrDefault(d => d.Id == dto.Id) : null;
                if (existing != null)
                {
                    existing.Name = dto.Name.Trim();
                    existing.FileUrl = dto.FileUrl;
                    existing.FileName = dto.FileName;
                    existing.FileType = dto.FileType;
                }
                else
                {
                    page.Documents.Add(new ServiceDocument
                    {
                        Name = dto.Name.Trim(),
                        FileUrl = dto.FileUrl,
                        FileName = dto.FileName,
                        FileType = dto.FileType
                    });
                }
            }
        }

        private static void ReplaceFaqs(ServiceIntroPage page, List<ServiceFaqDto>? faqs)
        {
            var incoming = (faqs ?? new List<ServiceFaqDto>())
                .Where(f => !string.IsNullOrWhiteSpace(f.Question) && !string.IsNullOrWhiteSpace(f.Answer))
                .Take(10)
                .ToList();

            var incomingIds = incoming.Where(f => f.Id > 0).Select(f => f.Id).ToHashSet();
            foreach (var existing in page.Faqs.Where(f => !incomingIds.Contains(f.Id)).ToList())
            {
                page.Faqs.Remove(existing);
            }

            foreach (var dto in incoming)
            {
                var existing = dto.Id > 0 ? page.Faqs.FirstOrDefault(f => f.Id == dto.Id) : null;
                if (existing != null)
                {
                    existing.Question = dto.Question.Trim();
                    existing.Answer = dto.Answer.Trim();
                }
                else
                {
                    page.Faqs.Add(new ServiceFaq
                    {
                        Question = dto.Question.Trim(),
                        Answer = dto.Answer.Trim()
                    });
                }
            }
        }

        private sealed class PublishedSnapshot
        {
            public string Description { get; set; } = "";
            public string ProcessingDuration { get; set; } = "";
            public string? VideoUrl { get; set; }
            public string? VideoFileName { get; set; }
            public List<ServiceDocumentDto>? Documents { get; set; }
            public List<ServiceFaqDto>? Faqs { get; set; }
        }
    }
}
