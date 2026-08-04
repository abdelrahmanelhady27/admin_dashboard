using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Entites.QuickLinks;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
    }
}
