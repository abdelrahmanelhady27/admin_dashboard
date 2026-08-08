using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class NewsEmojiRepository : GenericRepository<NewsEmoji>, INewsEmojiRepository
    {
        public NewsEmojiRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<NewsEmoji> Items, int TotalCount)> SearchAsync(
            string? search,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending)
        {
            var query = _context.NewsEmojis
                .AsNoTracking()
                .Where(e => !e.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(e =>
                    e.Name.ToLower().Contains(term) ||
                    e.Code.ToLower().Contains(term));
            }

            if (isActive.HasValue)
            {
                query = query.Where(e => e.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            query = ApplySort(query, sortBy, sortDescending);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<NewsEmoji?> GetActiveByIdAsync(int id)
        {
            return await _context.NewsEmojis
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
        }

        public async Task<bool> IsAssignedToCategoryWithPublishedNewsAsync(int emojiId)
        {
            return await _context.NewsCategoryEmojis
                .Where(ce => !ce.IsDeleted && ce.EmojiId == emojiId)
                .AnyAsync(ce => _context.EmployeeNewsItems.Any(n =>
                    !n.IsDeleted &&
                    n.CategoryId == ce.CategoryId &&
                    n.Status == PageStatus.Published));
        }

        public async Task SoftDeleteCategoryLinksAsync(int emojiId)
        {
            var links = await _context.NewsCategoryEmojis
                .Where(ce => ce.EmojiId == emojiId && !ce.IsDeleted)
                .ToListAsync();

            foreach (var link in links)
            {
                link.IsDeleted = true;
            }
        }

        public async Task ShiftDisplayOrdersForInsertAsync(int displayOrder)
        {
            var items = await _context.NewsEmojis
                .Where(e => !e.IsDeleted && e.DisplayOrder >= displayOrder)
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
                var items = await _context.NewsEmojis
                    .Where(e => !e.IsDeleted && e.Id != excludeId && e.DisplayOrder >= newOrder && e.DisplayOrder < oldOrder)
                    .ToListAsync();
                foreach (var item in items)
                {
                    item.DisplayOrder++;
                }
            }
            else
            {
                var items = await _context.NewsEmojis
                    .Where(e => !e.IsDeleted && e.Id != excludeId && e.DisplayOrder > oldOrder && e.DisplayOrder <= newOrder)
                    .ToListAsync();
                foreach (var item in items)
                {
                    item.DisplayOrder--;
                }
            }
        }

        private static IQueryable<NewsEmoji> ApplySort(
            IQueryable<NewsEmoji> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "name" => sortDescending
                    ? query.OrderByDescending(e => e.Name)
                    : query.OrderBy(e => e.Name),
                "code" => sortDescending
                    ? query.OrderByDescending(e => e.Code)
                    : query.OrderBy(e => e.Code),
                "createdat" => sortDescending
                    ? query.OrderByDescending(e => e.CreatedAt)
                    : query.OrderBy(e => e.CreatedAt),
                "modifiedat" => sortDescending
                    ? query.OrderByDescending(e => e.ModifiedAt ?? e.CreatedAt)
                    : query.OrderBy(e => e.ModifiedAt ?? e.CreatedAt),
                "isactive" => sortDescending
                    ? query.OrderByDescending(e => e.IsActive)
                    : query.OrderBy(e => e.IsActive),
                "displayorder" or _ => sortDescending
                    ? query.OrderByDescending(e => e.DisplayOrder).ThenByDescending(e => e.Name)
                    : query.OrderBy(e => e.DisplayOrder).ThenBy(e => e.Name)
            };
        }
    }
}
