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

        public async Task<IEnumerable<AuditLog>> SearchAsync(
            string? search,
            string? actionType,
            string? entityType,
            DateTime? from,
            DateTime? to)
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

            return await query
                .OrderByDescending(x => x.PerformedAt)
                .ToListAsync();
        }
    }
}
