using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IServiceIntroPageRepository : IGenericRepository<ServiceIntroPage>
    {
        Task<(IEnumerable<ServiceIntroPage> Items, int TotalCount)> GetAllWithDetailsAsync(
            string? search,
            string? status,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending);
        Task<ServiceIntroPage?> GetByIdWithDetailsAsync(int id);
        Task<ServiceIntroPage?> GetByServiceIdAsync(int serviceId);
        Task<IEnumerable<AvailableLinkedService>> GetAvailableLinkedServicesAsync();
        Task<LinkedService?> GetActiveLinkedServiceByIdAsync(int serviceId);
        Task ReplaceFaqAssignmentsAsync(int pageId, IEnumerable<int> faqIds);
    }
}
