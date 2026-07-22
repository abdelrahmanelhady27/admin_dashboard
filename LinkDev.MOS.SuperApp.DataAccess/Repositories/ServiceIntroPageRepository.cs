using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class ServiceIntroPageRepository : GenericRepository<ServiceIntroPage>, IServiceIntroPageRepository
    {
        public ServiceIntroPageRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<ServiceIntroPage>> GetAllWithDetailsAsync(string? search, string? status)
        {
            var query = _context.ServiceIntroPages
                .AsNoTracking()
                .Include(p => p.Service)
                .Include(p => p.Documents)
                .Include(p => p.Faqs)
                .Where(p => !p.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(p =>
                    (p.Service != null && p.Service.NameAr.ToLower().Contains(term)) ||
                    (p.Service != null && p.Service.NameEn.ToLower().Contains(term)) ||
                    p.Description.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<PageStatus>(status.Trim(), true, out var pageStatus))
                {
                    throw new ArgumentException(
                        $"Invalid status '{status}'. Allowed values: {string.Join(", ", Enum.GetNames<PageStatus>())}.");
                }

                query = query.Where(p => p.Status == pageStatus);
            }

            return await query
                .OrderByDescending(p => p.ModifiedAt ?? p.CreatedAt)
                .ToListAsync();
        }

        public async Task<ServiceIntroPage?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.ServiceIntroPages
                .Include(p => p.Service)
                .Include(p => p.Documents)
                .Include(p => p.Faqs)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<ServiceIntroPage?> GetByServiceIdAsync(int serviceId)
        {
            return await _context.ServiceIntroPages
                .Include(p => p.Service)
                .Include(p => p.Documents)
                .Include(p => p.Faqs)
                .FirstOrDefaultAsync(p => p.ServiceId == serviceId && !p.IsDeleted);
        }
    }
}
