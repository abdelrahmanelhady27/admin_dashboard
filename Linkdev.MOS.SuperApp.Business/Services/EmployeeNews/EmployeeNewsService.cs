using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.EmployeeNews
{
    public class EmployeeNewsService : IEmployeeNewsService
    {
        private readonly IEmployeeNewsRepository _newsRepo;
        private readonly INewsCategoryRepository _categoryRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public EmployeeNewsService(
            IEmployeeNewsRepository newsRepo,
            INewsCategoryRepository categoryRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _newsRepo = newsRepo;
            _categoryRepo = categoryRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<EmployeeNewsDto>> GetAllAsync(EmployeeNewsSearchDto request)
        {
            var (items, totalCount) = await _newsRepo.SearchAsync(
                request.Search,
                request.Status,
                request.CategoryId,
                request.PageNumber,
                request.PageSize,
                request.SortBy,
                request.SortDescending);

            return new PagedResult<EmployeeNewsDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }

        public async Task<EmployeeNewsDto?> GetByIdAsync(int id)
        {
            var item = await _newsRepo.GetByIdWithDetailsAsync(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<EmployeeNewsDto> CreateAsync(CreateEmployeeNewsDto dto)
        {
            if (dto.CategoryId.HasValue)
            {
                await EnsureCategoryAssignableAsync(dto.CategoryId.Value, requireActive: dto.Publish);
            }

            var item = new EmployeeNewsItem
            {
                Title = dto.Title?.Trim() ?? "",
                Content = dto.Content?.Trim() ?? "",
                CategoryId = dto.CategoryId,
                Status = PageStatus.Draft,
                ImageUrl = dto.ImageUrl,
                ImageFileName = dto.ImageFileName,
                Attachments = MapAttachments(dto.Attachments)
            };

            await _newsRepo.AddAsync(item);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Create,
                AuditEntityType.EmployeeNews,
                item.Title,
                item.Id);

            if (dto.Publish)
            {
                var published = await PublishAsync(item.Id);
                if (published != null)
                {
                    return published;
                }
            }

            var created = await _newsRepo.GetByIdWithDetailsAsync(item.Id);
            return MapToDto(created!);
        }

        public async Task<EmployeeNewsDto?> UpdateAsync(int id, UpdateEmployeeNewsDto dto)
        {
            var item = await _newsRepo.GetByIdWithDetailsAsync(id);
            if (item == null)
            {
                return null;
            }

            if (dto.CategoryId.HasValue)
            {
                await EnsureCategoryAssignableAsync(dto.CategoryId.Value, requireActive: false);
            }

            item.Title = dto.Title?.Trim() ?? "";
            item.Content = dto.Content?.Trim() ?? "";
            item.CategoryId = dto.CategoryId;
            item.ImageUrl = dto.ImageUrl;
            item.ImageFileName = dto.ImageFileName;
            ReplaceAttachments(item, dto.Attachments);

            if (dto.SaveAsDraft
                && (item.Status == PageStatus.Published || item.Status == PageStatus.Unpublished))
            {
                item.Status = PageStatus.Draft;
            }

            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.EmployeeNews,
                item.Title,
                id);

            var updated = await _newsRepo.GetByIdWithDetailsAsync(id);
            return MapToDto(updated!);
        }

        public async Task<EmployeeNewsDto?> PublishAsync(int id)
        {
            var item = await _newsRepo.GetByIdWithDetailsAsync(id);
            if (item == null)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(item.Title) || string.IsNullOrWhiteSpace(item.Content))
            {
                throw new InvalidOperationException("Please complete the required data before publishing the news item");
            }

            if (!item.CategoryId.HasValue)
            {
                throw new InvalidOperationException("Please select an active category before publishing");
            }

            await EnsureCategoryAssignableAsync(item.CategoryId.Value, requireActive: true);

            item.Status = PageStatus.Published;
            item.PublishedAt = DateTime.UtcNow;

            _newsRepo.Update(item);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Publish,
                AuditEntityType.EmployeeNews,
                item.Title,
                id);

            var published = await _newsRepo.GetByIdWithDetailsAsync(id);
            return MapToDto(published!);
        }

        public async Task<EmployeeNewsDto?> UnpublishAsync(int id)
        {
            var item = await _newsRepo.GetByIdWithDetailsAsync(id);
            if (item == null)
            {
                return null;
            }

            item.Status = PageStatus.Unpublished;
            _newsRepo.Update(item);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Unpublish,
                AuditEntityType.EmployeeNews,
                item.Title,
                id);

            var unpublished = await _newsRepo.GetByIdWithDetailsAsync(id);
            return MapToDto(unpublished!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var item = await _newsRepo.GetByIdWithDetailsAsync(id);
            if (item == null)
            {
                return false;
            }

            var title = item.Title;
            item.IsDeleted = true;
            foreach (var attachment in item.Attachments.Where(a => !a.IsDeleted))
            {
                attachment.IsDeleted = true;
            }

            _newsRepo.Update(item);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Delete,
                AuditEntityType.EmployeeNews,
                title,
                id);

            return true;
        }

        private async Task EnsureCategoryAssignableAsync(int categoryId, bool requireActive)
        {
            var category = await _categoryRepo.GetByIdWithEmojisAsync(categoryId);
            if (category == null)
            {
                throw new InvalidOperationException("The selected category was not found or is not available.");
            }

            if (requireActive && !category.IsActive)
            {
                throw new InvalidOperationException("Please select an active category before publishing");
            }
        }

        private EmployeeNewsDto MapToDto(EmployeeNewsItem item)
        {
            var dto = _mapper.Map<EmployeeNewsDto>(item);
            dto.CategoryName = item.Category is { IsDeleted: false } ? item.Category.Name : null;
            dto.Status = item.Status.ToString();
            dto.Attachments = item.Attachments?
                .Where(a => !a.IsDeleted)
                .Select(a => _mapper.Map<NewsAttachmentDto>(a))
                .ToList() ?? new List<NewsAttachmentDto>();
            return dto;
        }

        private static List<NewsAttachment> MapAttachments(List<NewsAttachmentDto>? attachments)
        {
            return (attachments ?? new List<NewsAttachmentDto>())
                .Where(a => !string.IsNullOrWhiteSpace(a.Name))
                .Take(5)
                .Select(a => new NewsAttachment
                {
                    Name = a.Name.Trim(),
                    FileUrl = a.FileUrl,
                    FileName = a.FileName,
                    FileType = a.FileType
                }).ToList();
        }

        private static void ReplaceAttachments(EmployeeNewsItem item, List<NewsAttachmentDto>? attachments)
        {
            var incoming = (attachments ?? new List<NewsAttachmentDto>())
                .Where(a => !string.IsNullOrWhiteSpace(a.Name))
                .Take(5)
                .ToList();

            var incomingIds = incoming.Where(a => a.Id > 0).Select(a => a.Id).ToHashSet();
            foreach (var existing in item.Attachments.Where(a => !incomingIds.Contains(a.Id)).ToList())
            {
                existing.IsDeleted = true;
            }

            foreach (var dto in incoming)
            {
                var existing = dto.Id > 0 ? item.Attachments.FirstOrDefault(a => a.Id == dto.Id) : null;
                if (existing != null)
                {
                    existing.Name = dto.Name.Trim();
                    existing.FileUrl = dto.FileUrl;
                    existing.FileName = dto.FileName;
                    existing.FileType = dto.FileType;
                    existing.IsDeleted = false;
                }
                else
                {
                    item.Attachments.Add(new NewsAttachment
                    {
                        Name = dto.Name.Trim(),
                        FileUrl = dto.FileUrl,
                        FileName = dto.FileName,
                        FileType = dto.FileType
                    });
                }
            }
        }
    }
}
