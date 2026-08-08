using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.EmployeeNews
{
    public class NewsCategoryService : INewsCategoryService
    {
        private readonly INewsCategoryRepository _categoryRepo;
        private readonly INewsEmojiRepository _emojiRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public NewsCategoryService(
            INewsCategoryRepository categoryRepo,
            INewsEmojiRepository emojiRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _categoryRepo = categoryRepo;
            _emojiRepo = emojiRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<NewsCategoryDto>> GetAllAsync(NewsCategorySearchDto request)
        {
            var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
            var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

            var (items, totalCount) = await _categoryRepo.SearchAsync(
                request.Search,
                request.IsActive,
                pageNumber,
                pageSize,
                request.SortBy,
                request.SortDescending);

            return new PagedResult<NewsCategoryDto>
            {
                Items = items.Select(MapToDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<NewsCategoryDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepo.GetByIdWithEmojisAsync(id);
            return category == null ? null : MapToDto(category);
        }

        public async Task<NewsCategoryDto> CreateAsync(CreateNewsCategoryDto dto)
        {
            await EnsureEmojisExistAsync(dto.EmojiIds);

            var displayOrder = Math.Max(1, dto.DisplayOrder);
            await _categoryRepo.ShiftDisplayOrdersForInsertAsync(displayOrder);

            var category = new NewsCategory
            {
                Name = dto.Name.Trim(),
                DisplayOrder = displayOrder,
                IsActive = dto.IsActive
            };

            await _categoryRepo.AddAsync(category);
            await _unitOfWork.SaveChangesAsync();

            if (dto.EmojiIds.Count > 0)
            {
                await _categoryRepo.ReplaceEmojiAssignmentsAsync(category.Id, dto.EmojiIds);
                await _unitOfWork.SaveChangesAsync();
            }

            await _auditLogService.LogAsync(
                AuditActionType.Create,
                AuditEntityType.NewsCategory,
                category.Name,
                category.Id);

            var created = await _categoryRepo.GetByIdWithEmojisAsync(category.Id);
            return MapToDto(created!);
        }

        public async Task<NewsCategoryDto?> UpdateAsync(int id, UpdateNewsCategoryDto dto)
        {
            var category = await _categoryRepo.GetByIdWithEmojisAsync(id);
            if (category == null)
            {
                return null;
            }

            var wasActive = category.IsActive;

            if (!dto.IsActive && category.IsActive)
            {
                await EnsureCanDeactivateOrDeleteAsync(id);
                await _categoryRepo.ClearCategoryFromNonPublishedNewsAsync(id);
            }

            await EnsureEmojisExistAsync(dto.EmojiIds);

            var displayOrder = Math.Max(1, dto.DisplayOrder);
            if (displayOrder != category.DisplayOrder)
            {
                await _categoryRepo.ShiftDisplayOrdersForMoveAsync(category.DisplayOrder, displayOrder, id);
            }

            category.Name = dto.Name.Trim();
            category.DisplayOrder = displayOrder;
            category.IsActive = dto.IsActive;

            await _categoryRepo.ReplaceEmojiAssignmentsAsync(id, dto.EmojiIds);
            await _unitOfWork.SaveChangesAsync();

            var action = ResolveActiveToggleAction(wasActive, dto.IsActive) ?? AuditActionType.Update;
            await _auditLogService.LogAsync(
                action,
                AuditEntityType.NewsCategory,
                category.Name,
                id);

            var updated = await _categoryRepo.GetByIdWithEmojisAsync(id);
            return MapToDto(updated!);
        }

        public async Task<NewsCategoryDto?> SaveEmojisAsync(int id, SaveCategoryEmojisDto dto)
        {
            var category = await _categoryRepo.GetByIdWithEmojisAsync(id);
            if (category == null)
            {
                return null;
            }

            await EnsureEmojisExistAsync(dto.EmojiIds);
            await _categoryRepo.ReplaceEmojiAssignmentsAsync(id, dto.EmojiIds);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Update,
                AuditEntityType.NewsCategory,
                category.Name,
                id);

            var updated = await _categoryRepo.GetByIdWithEmojisAsync(id);
            return MapToDto(updated!);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _categoryRepo.GetByIdWithEmojisAsync(id);
            if (category == null)
            {
                return false;
            }

            await EnsureCanDeactivateOrDeleteAsync(id);
            await _categoryRepo.ClearCategoryFromNonPublishedNewsAsync(id);

            var name = category.Name;
            category.IsDeleted = true;
            category.IsActive = false;
            foreach (var link in category.CategoryEmojis.Where(ce => !ce.IsDeleted))
            {
                link.IsDeleted = true;
            }

            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Delete,
                AuditEntityType.NewsCategory,
                name,
                id);

            return true;
        }

        private async Task EnsureCanDeactivateOrDeleteAsync(int categoryId)
        {
            if (await _categoryRepo.HasPublishedNewsAsync(categoryId))
            {
                throw new InvalidOperationException(
                    "Cannot deactivate or delete a category that has published news");
            }
        }

        private async Task EnsureEmojisExistAsync(IEnumerable<int> emojiIds)
        {
            foreach (var emojiId in emojiIds.Distinct())
            {
                var emoji = await _emojiRepo.GetActiveByIdAsync(emojiId);
                if (emoji == null || !emoji.IsActive)
                {
                    throw new InvalidOperationException($"Emoji '{emojiId}' was not found or is inactive.");
                }
            }
        }

        private static AuditActionType? ResolveActiveToggleAction(bool wasActive, bool isActive)
        {
            if (wasActive && !isActive)
            {
                return AuditActionType.Suspend;
            }

            if (!wasActive && isActive)
            {
                return AuditActionType.Activate;
            }

            return null;
        }

        private NewsCategoryDto MapToDto(NewsCategory category)
        {
            var dto = _mapper.Map<NewsCategoryDto>(category);
            dto.Emojis = category.CategoryEmojis
                .Where(ce => !ce.IsDeleted && ce.Emoji != null && !ce.Emoji.IsDeleted)
                .Select(ce => _mapper.Map<NewsEmojiDto>(ce.Emoji!))
                .OrderBy(e => e.DisplayOrder)
                .ToList();
            return dto;
        }
    }
}
