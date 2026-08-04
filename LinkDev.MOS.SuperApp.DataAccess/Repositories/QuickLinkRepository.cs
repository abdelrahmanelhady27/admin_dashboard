using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.QuickLinks;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class QuickLinkRepository : GenericRepository<QuickLink>, IQuickLinkRepository
    {
        public QuickLinkRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<QuickLink>> GetAllOrderedAsync()
        {
            return await _context.QuickLinks
                .AsNoTracking()
                .Include(q => q.Service)!
                    .ThenInclude(s => s!.System)
                .Where(q => !q.IsDeleted)
                .OrderBy(q => q.DisplayOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<QuickLink>> GetAllIncludingDeletedAsync()
        {
            return await _context.QuickLinks
                .Include(q => q.Service)!
                    .ThenInclude(s => s!.System)
                .ToListAsync();
        }

        public async Task<IEnumerable<LinkedService>> GetAvailableServicesAsync()
        {
            var existingServiceIds = await _context.QuickLinks
                .AsNoTracking()
                .Where(q => !q.IsDeleted)
                .Select(q => q.ServiceId)
                .ToListAsync();

            var existingSet = existingServiceIds.ToHashSet();

            return await _context.LinkedServices
                .AsNoTracking()
                .Include(s => s.System)
                .Where(s => !s.IsDeleted
                    && s.IsActive
                    && !string.IsNullOrEmpty(s.DeepLink)
                    && !existingSet.Contains(s.Id))
                .OrderBy(s => s.SystemId)
                .ThenBy(s => s.NameEn)
                .ToListAsync();
        }

        public async Task<IEnumerable<LinkedService>> GetLinkedServicesByIdsAsync(IEnumerable<int> serviceIds)
        {
            var ids = serviceIds.ToList();
            return await _context.LinkedServices
                .Where(s => ids.Contains(s.Id) && !s.IsDeleted)
                .ToListAsync();
        }
    }
}
