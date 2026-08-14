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

        public async Task<(IEnumerable<ServiceIntroPage> Items, int TotalCount)> GetAllWithDetailsAsync(
            string? search,
            string? status,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending)
        {
            var query = _context.ServiceIntroPages
                .AsNoTracking()
                .Include(p => p.Service)
                .Include(p => p.Documents)
                .Include(p => p.PageFaqs)
                    .ThenInclude(pf => pf.Faq)
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

            var totalCount = await query.CountAsync();

            query = ApplySort(query, sortBy, sortDescending);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        private static IQueryable<ServiceIntroPage> ApplySort(
            IQueryable<ServiceIntroPage> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "createdat" => sortDescending
                    ? query.OrderByDescending(p => p.CreatedAt)
                    : query.OrderBy(p => p.CreatedAt),
                "status" => sortDescending
                    ? query.OrderByDescending(p => p.Status)
                    : query.OrderBy(p => p.Status),
                "modifiedat" => sortDescending
                    ? query.OrderByDescending(p => p.ModifiedAt ?? p.CreatedAt)
                    : query.OrderBy(p => p.ModifiedAt ?? p.CreatedAt),
                _ => sortDescending
                    ? query.OrderByDescending(p => p.ModifiedAt ?? p.CreatedAt)
                    : query.OrderBy(p => p.ModifiedAt ?? p.CreatedAt)
            };
        }

        public async Task<ServiceIntroPage?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.ServiceIntroPages
                .Include(p => p.Service)
                .Include(p => p.Documents)
                .Include(p => p.PageFaqs)
                    .ThenInclude(pf => pf.Faq)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        }

        public async Task<ServiceIntroPage?> GetByServiceIdAsync(int serviceId)
        {
            return await _context.ServiceIntroPages
                .Include(p => p.Service)
                .Include(p => p.Documents)
                .Include(p => p.PageFaqs)
                    .ThenInclude(pf => pf.Faq)
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

        public async Task ReplaceFaqAssignmentsAsync(int pageId, IEnumerable<int> faqIds)
        {
            var desired = faqIds.Distinct().ToHashSet();

            var existing = await _context.ServiceIntroPageFaqs
                .Where(pf => pf.ServiceIntroPageId == pageId)
                .ToListAsync();

            foreach (var link in existing.Where(pf => !pf.IsDeleted && !desired.Contains(pf.FaqId)))
            {
                link.IsDeleted = true;
            }

            foreach (var faqId in desired)
            {
                var softDeleted = existing.FirstOrDefault(pf => pf.FaqId == faqId && pf.IsDeleted);
                if (softDeleted != null)
                {
                    softDeleted.IsDeleted = false;
                    continue;
                }

                if (existing.Any(pf => pf.FaqId == faqId && !pf.IsDeleted))
                {
                    continue;
                }

                await _context.ServiceIntroPageFaqs.AddAsync(new ServiceIntroPageFaq
                {
                    ServiceIntroPageId = pageId,
                    FaqId = faqId
                });
            }
        }
    }
}
