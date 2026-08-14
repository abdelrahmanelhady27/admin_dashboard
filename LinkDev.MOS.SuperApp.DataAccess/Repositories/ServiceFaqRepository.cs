using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class ServiceFaqRepository : GenericRepository<ServiceFaq>, IServiceFaqRepository
    {
        public ServiceFaqRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<ServiceFaq> Items, int TotalCount)> SearchAsync(
            string? search,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending)
        {
            var query = _context.ServiceFaqs
                .AsNoTracking()
                .Where(f => !f.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(f =>
                    f.Question.ToLower().Contains(term) ||
                    f.Answer.ToLower().Contains(term));
            }

            if (isActive.HasValue)
            {
                query = query.Where(f => f.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            query = ApplySort(query, sortBy, sortDescending);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<ServiceFaq?> GetActiveByIdAsync(int id)
        {
            return await _context.ServiceFaqs
                .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);
        }

        public async Task<bool> IsAssignedToPublishedPageAsync(int faqId)
        {
            return await _context.ServiceIntroPageFaqs
                .Where(pf => !pf.IsDeleted && pf.FaqId == faqId)
                .AnyAsync(pf => _context.ServiceIntroPages.Any(p =>
                    !p.IsDeleted &&
                    p.Id == pf.ServiceIntroPageId &&
                    p.Status == PageStatus.Published));
        }

        public async Task SoftDeletePageLinksAsync(int faqId)
        {
            var links = await _context.ServiceIntroPageFaqs
                .Where(pf => pf.FaqId == faqId && !pf.IsDeleted)
                .ToListAsync();

            foreach (var link in links)
            {
                link.IsDeleted = true;
            }
        }

        public async Task ShiftDisplayOrdersForInsertAsync(int displayOrder)
        {
            var items = await _context.ServiceFaqs
                .Where(f => !f.IsDeleted && f.DisplayOrder >= displayOrder)
                .ToListAsync();

            foreach (var item in items)
            {
                item.DisplayOrder++;
            }
        }

        public async Task ShiftDisplayOrdersForMoveAsync(int oldOrder, int newOrder, int excludeId)
        {
            if (oldOrder == newOrder)
            {
                return;
            }

            if (newOrder < oldOrder)
            {
                var items = await _context.ServiceFaqs
                    .Where(f => !f.IsDeleted && f.Id != excludeId && f.DisplayOrder >= newOrder && f.DisplayOrder < oldOrder)
                    .ToListAsync();
                foreach (var item in items)
                {
                    item.DisplayOrder++;
                }
            }
            else
            {
                var items = await _context.ServiceFaqs
                    .Where(f => !f.IsDeleted && f.Id != excludeId && f.DisplayOrder > oldOrder && f.DisplayOrder <= newOrder)
                    .ToListAsync();
                foreach (var item in items)
                {
                    item.DisplayOrder--;
                }
            }
        }

        private static IQueryable<ServiceFaq> ApplySort(
            IQueryable<ServiceFaq> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "question" => sortDescending
                    ? query.OrderByDescending(f => f.Question)
                    : query.OrderBy(f => f.Question),
                "answer" => sortDescending
                    ? query.OrderByDescending(f => f.Answer)
                    : query.OrderBy(f => f.Answer),
                "createdat" => sortDescending
                    ? query.OrderByDescending(f => f.CreatedAt)
                    : query.OrderBy(f => f.CreatedAt),
                "modifiedat" => sortDescending
                    ? query.OrderByDescending(f => f.ModifiedAt ?? f.CreatedAt)
                    : query.OrderBy(f => f.ModifiedAt ?? f.CreatedAt),
                "isactive" => sortDescending
                    ? query.OrderByDescending(f => f.IsActive)
                    : query.OrderBy(f => f.IsActive),
                "displayorder" or _ => sortDescending
                    ? query.OrderByDescending(f => f.DisplayOrder).ThenByDescending(f => f.Question)
                    : query.OrderBy(f => f.DisplayOrder).ThenBy(f => f.Question)
            };
        }
    }
}
