using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.QuickLinks;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IQuickLinkRepository : IGenericRepository<QuickLink>
    {
        Task<IEnumerable<QuickLink>> GetAllOrderedAsync();
        Task<IEnumerable<QuickLink>> GetAllIncludingDeletedAsync();
        Task<IEnumerable<LinkedService>> GetAvailableServicesAsync();
        Task<IEnumerable<LinkedService>> GetLinkedServicesByIdsAsync(IEnumerable<int> serviceIds);
    }
}
