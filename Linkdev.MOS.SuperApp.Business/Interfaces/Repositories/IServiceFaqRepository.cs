using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IServiceFaqRepository : IGenericRepository<ServiceFaq>
    {
        Task<(IEnumerable<ServiceFaq> Items, int TotalCount)> SearchAsync(
            string? search,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending);
        Task<ServiceFaq?> GetActiveByIdAsync(int id);
        Task<bool> IsAssignedToPublishedPageAsync(int faqId);
        Task SoftDeletePageLinksAsync(int faqId);
        Task ShiftDisplayOrdersForInsertAsync(int displayOrder);
        Task ShiftDisplayOrdersForMoveAsync(int oldOrder, int newOrder, int excludeId);
    }
}
