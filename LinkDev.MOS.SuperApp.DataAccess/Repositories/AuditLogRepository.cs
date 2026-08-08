using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.AuditLog;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class AuditLogRepository : GenericRepository<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> SearchAsync(
            string? search,
            string? actionType,
            string? entityType,
            DateTime? from,
            DateTime? to,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(x =>
                    x.EntityName.ToLower().Contains(term) ||
                    x.PerformedBy.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(actionType) &&
                Enum.TryParse<AuditActionType>(actionType, true, out var parsedAction))
            {
                query = query.Where(x => x.ActionType == parsedAction);
            }

            if (!string.IsNullOrWhiteSpace(entityType) &&
                Enum.TryParse<AuditEntityType>(entityType, true, out var parsedEntity))
            {
                query = query.Where(x => x.EntityType == parsedEntity);
            }

            if (from.HasValue)
            {
                query = query.Where(x => x.PerformedAt >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(x => x.PerformedAt <= to.Value);
            }

            var totalCount = await query.CountAsync();

            query = ApplySort(query, sortBy, sortDescending);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        private static IQueryable<AuditLog> ApplySort(
            IQueryable<AuditLog> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "entityname" => sortDescending
                    ? query.OrderByDescending(x => x.EntityName)
                    : query.OrderBy(x => x.EntityName),
                "performedby" => sortDescending
                    ? query.OrderByDescending(x => x.PerformedBy)
                    : query.OrderBy(x => x.PerformedBy),
                "performedat" => sortDescending
                    ? query.OrderByDescending(x => x.PerformedAt)
                    : query.OrderBy(x => x.PerformedAt),
                _ => sortDescending
                    ? query.OrderByDescending(x => x.PerformedAt)
                    : query.OrderBy(x => x.PerformedAt)
            };
        }
    }
}
