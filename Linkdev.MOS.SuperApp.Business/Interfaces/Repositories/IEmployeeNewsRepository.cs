using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IEmployeeNewsRepository : IGenericRepository<EmployeeNewsItem>
    {
        Task<(IEnumerable<EmployeeNewsItem> Items, int TotalCount)> SearchAsync(
            string? search,
            string? status,
            int? categoryId,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending);

        Task<EmployeeNewsItem?> GetByIdWithDetailsAsync(int id);
    }
}
