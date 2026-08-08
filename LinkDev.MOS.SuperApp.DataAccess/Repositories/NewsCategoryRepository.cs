using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class NewsCategoryRepository : GenericRepository<NewsCategory>, INewsCategoryRepository
    {
        public NewsCategoryRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<NewsCategory> Items, int TotalCount)> SearchAsync(
            string? search,
            bool? isActive,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending)
        {
            var query = _context.NewsCategories
                .AsNoTracking()
                .Include(c => c.CategoryEmojis.Where(ce => !ce.IsDeleted))
                    .ThenInclude(ce => ce.Emoji)
                .Where(c => !c.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(term));
            }

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            query = ApplySort(query, sortBy, sortDescending);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<NewsCategory?> GetByIdWithEmojisAsync(int id)
        {
            return await _context.NewsCategories
                .Include(c => c.CategoryEmojis.Where(ce => !ce.IsDeleted))
                    .ThenInclude(ce => ce.Emoji)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);
        }

        public async Task<bool> HasPublishedNewsAsync(int categoryId)
        {
            return await _context.EmployeeNewsItems
                .AnyAsync(n =>
                    !n.IsDeleted &&
                    n.CategoryId == categoryId &&
                    n.Status == PageStatus.Published);
        }

        public async Task ClearCategoryFromNonPublishedNewsAsync(int categoryId)
        {
            var items = await _context.EmployeeNewsItems
                .Where(n =>
                    !n.IsDeleted &&
                    n.CategoryId == categoryId &&
                    n.Status != PageStatus.Published)
                .ToListAsync();

            foreach (var item in items)
            {
                item.CategoryId = null;
            }
        }

        public async Task ReplaceEmojiAssignmentsAsync(int categoryId, IEnumerable<int> emojiIds)
        {
            var desired = emojiIds.Distinct().ToHashSet();

            var existing = await _context.NewsCategoryEmojis
                .Where(ce => ce.CategoryId == categoryId)
                .ToListAsync();

            foreach (var link in existing.Where(ce => !ce.IsDeleted && !desired.Contains(ce.EmojiId)))
            {
                link.IsDeleted = true;
            }

            foreach (var emojiId in desired)
            {
                var softDeleted = existing.FirstOrDefault(ce => ce.EmojiId == emojiId && ce.IsDeleted);
                if (softDeleted != null)
                {
                    softDeleted.IsDeleted = false;
                    continue;
                }

                if (existing.Any(ce => ce.EmojiId == emojiId && !ce.IsDeleted))
                {
                    continue;
                }

                await _context.NewsCategoryEmojis.AddAsync(new NewsCategoryEmoji
                {
                    CategoryId = categoryId,
                    EmojiId = emojiId
                });
            }
        }

        public async Task ShiftDisplayOrdersForInsertAsync(int displayOrder)
        {
            var items = await _context.NewsCategories
                .Where(c => !c.IsDeleted && c.DisplayOrder >= displayOrder)
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
                var items = await _context.NewsCategories
                    .Where(c => !c.IsDeleted && c.Id != excludeId && c.DisplayOrder >= newOrder && c.DisplayOrder < oldOrder)
                    .ToListAsync();
                foreach (var item in items)
                {
                    item.DisplayOrder++;
                }
            }
            else
            {
                var items = await _context.NewsCategories
                    .Where(c => !c.IsDeleted && c.Id != excludeId && c.DisplayOrder > oldOrder && c.DisplayOrder <= newOrder)
                    .ToListAsync();
                foreach (var item in items)
                {
                    item.DisplayOrder--;
                }
            }
        }

        private static IQueryable<NewsCategory> ApplySort(
            IQueryable<NewsCategory> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "name" => sortDescending
                    ? query.OrderByDescending(c => c.Name)
                    : query.OrderBy(c => c.Name),
                "createdat" => sortDescending
                    ? query.OrderByDescending(c => c.CreatedAt)
                    : query.OrderBy(c => c.CreatedAt),
                "modifiedat" => sortDescending
                    ? query.OrderByDescending(c => c.ModifiedAt ?? c.CreatedAt)
                    : query.OrderBy(c => c.ModifiedAt ?? c.CreatedAt),
                "isactive" => sortDescending
                    ? query.OrderByDescending(c => c.IsActive)
                    : query.OrderBy(c => c.IsActive),
                "displayorder" or _ => sortDescending
                    ? query.OrderByDescending(c => c.DisplayOrder).ThenByDescending(c => c.Name)
                    : query.OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name)
            };
        }
    }
}
