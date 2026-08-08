using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.EmployeeNews
{
    public class NewsEmojiService : INewsEmojiService
    {
        private readonly INewsEmojiRepository _emojiRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAuditLogService _auditLogService;

        public NewsEmojiService(
            INewsEmojiRepository emojiRepo,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAuditLogService auditLogService)
        {
            _emojiRepo = emojiRepo;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _auditLogService = auditLogService;
        }

        public async Task<PagedResult<NewsEmojiDto>> GetAllAsync(NewsEmojiSearchDto request)
        {
            var pageNumber = request.PageNumber < 1 ? 1 : request.PageNumber;
            var pageSize = request.PageSize < 1 ? 10 : request.PageSize;

            var (items, totalCount) = await _emojiRepo.SearchAsync(
                request.Search,
                request.IsActive,
                pageNumber,
                pageSize,
                request.SortBy,
                request.SortDescending);

            return new PagedResult<NewsEmojiDto>
            {
                Items = _mapper.Map<List<NewsEmojiDto>>(items),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
        }

        public async Task<NewsEmojiDto?> GetByIdAsync(int id)
        {
            var emoji = await _emojiRepo.GetActiveByIdAsync(id);
            return emoji == null ? null : _mapper.Map<NewsEmojiDto>(emoji);
        }

        public async Task<NewsEmojiDto> CreateAsync(CreateNewsEmojiDto dto)
        {
            var displayOrder = Math.Max(1, dto.DisplayOrder);
            await _emojiRepo.ShiftDisplayOrdersForInsertAsync(displayOrder);

            var emoji = new NewsEmoji
            {
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim(),
                DisplayOrder = displayOrder,
                IsActive = dto.IsActive
            };

            await _emojiRepo.AddAsync(emoji);
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Create,
                AuditEntityType.NewsEmoji,
                emoji.Name,
                emoji.Id);

            return _mapper.Map<NewsEmojiDto>(emoji);
        }

        public async Task<NewsEmojiDto?> UpdateAsync(int id, UpdateNewsEmojiDto dto)
        {
            var emoji = await _emojiRepo.GetActiveByIdAsync(id);
            if (emoji == null)
            {
                return null;
            }

            var wasActive = emoji.IsActive;

            if (!dto.IsActive && emoji.IsActive)
            {
                if (await _emojiRepo.IsAssignedToCategoryWithPublishedNewsAsync(id))
                {
                    throw new InvalidOperationException(
                        "Cannot deactivate an emoji assigned to a category that has published news");
                }
            }

            var displayOrder = Math.Max(1, dto.DisplayOrder);
            if (displayOrder != emoji.DisplayOrder)
            {
                await _emojiRepo.ShiftDisplayOrdersForMoveAsync(emoji.DisplayOrder, displayOrder, id);
            }

            emoji.Name = dto.Name.Trim();
            emoji.Code = dto.Code.Trim();
            emoji.DisplayOrder = displayOrder;
            emoji.IsActive = dto.IsActive;

            await _unitOfWork.SaveChangesAsync();

            var action = wasActive && !dto.IsActive
                ? AuditActionType.Suspend
                : !wasActive && dto.IsActive
                    ? AuditActionType.Activate
                    : AuditActionType.Update;

            await _auditLogService.LogAsync(
                action,
                AuditEntityType.NewsEmoji,
                emoji.Name,
                id);

            return _mapper.Map<NewsEmojiDto>(emoji);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var emoji = await _emojiRepo.GetActiveByIdAsync(id);
            if (emoji == null)
            {
                return false;
            }

            if (await _emojiRepo.IsAssignedToCategoryWithPublishedNewsAsync(id))
            {
                throw new InvalidOperationException(
                    "Cannot delete an emoji assigned to a category that has published news");
            }

            var name = emoji.Name;
            await _emojiRepo.SoftDeleteCategoryLinksAsync(id);
            emoji.IsDeleted = true;
            emoji.IsActive = false;
            await _unitOfWork.SaveChangesAsync();

            await _auditLogService.LogAsync(
                AuditActionType.Delete,
                AuditEntityType.NewsEmoji,
                name,
                id);

            return true;
        }
    }
}
