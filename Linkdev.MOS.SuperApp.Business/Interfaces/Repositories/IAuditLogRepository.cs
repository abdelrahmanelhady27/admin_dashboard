using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.AuditLog;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IAuditLogRepository : IGenericRepository<AuditLog>
    {
        Task<(IEnumerable<AuditLog> Items, int TotalCount)> SearchAsync(
            string? search,
            string? actionType,
            string? entityType,
            DateTime? from,
            DateTime? to,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending);
    }
}
