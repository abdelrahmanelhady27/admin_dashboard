using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface INewsEmojiRepository : IGenericRepository<NewsEmoji>
    {
        Task<(IEnumerable<NewsEmoji> Items, int TotalCount)> SearchAsync(
            string? search,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending);
        Task<NewsEmoji?> GetActiveByIdAsync(int id);
        Task<bool> IsAssignedToCategoryWithPublishedNewsAsync(int emojiId);
        Task SoftDeleteCategoryLinksAsync(int emojiId);
        Task ShiftDisplayOrdersForInsertAsync(int displayOrder);
        Task ShiftDisplayOrdersForMoveAsync(int oldOrder, int newOrder, int excludeId);
    }
}
