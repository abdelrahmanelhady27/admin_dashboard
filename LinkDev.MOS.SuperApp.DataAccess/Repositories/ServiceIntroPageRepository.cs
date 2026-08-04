using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

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

        public async Task<IEnumerable<AvailableLinkedService>> GetAvailableLinkedServicesAsync()
        {
            return await _context.AvailableLinkedServices
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<LinkedService?> GetActiveLinkedServiceByIdAsync(int serviceId)
        {
            return await _context.LinkedServices
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == serviceId && !s.IsDeleted && s.IsActive);
        }
    }
}
