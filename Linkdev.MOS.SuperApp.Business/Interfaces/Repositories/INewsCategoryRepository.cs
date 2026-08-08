using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface INewsCategoryRepository : IGenericRepository<NewsCategory>
    {
        Task<(IEnumerable<NewsCategory> Items, int TotalCount)> SearchAsync(
            string? search,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending);
        Task<NewsCategory?> GetByIdWithEmojisAsync(int id);
        Task<bool> HasPublishedNewsAsync(int categoryId);
        Task ClearCategoryFromNonPublishedNewsAsync(int categoryId);
        Task ReplaceEmojiAssignmentsAsync(int categoryId, IEnumerable<int> emojiIds);
        Task ShiftDisplayOrdersForInsertAsync(int displayOrder);
        Task ShiftDisplayOrdersForMoveAsync(int oldOrder, int newOrder, int excludeId);
    }
}
