using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class EmployeeNewsRepository : GenericRepository<EmployeeNewsItem>, IEmployeeNewsRepository
    {
        public EmployeeNewsRepository(AdminDbContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<EmployeeNewsItem> Items, int TotalCount)> SearchAsync(
            string? search,
            string? status,
            int? categoryId,
            int pageNumber,
            int pageSize,
            string? sortBy,
            bool sortDescending)
        {
            var query = _context.EmployeeNewsItems
                .AsNoTracking()
                .Include(n => n.Category)
                .Include(n => n.Attachments.Where(a => !a.IsDeleted))
                .Where(n => !n.IsDeleted);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(n =>
                    n.Title.ToLower().Contains(term) ||
                    n.Content.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                if (!Enum.TryParse<PageStatus>(status.Trim(), true, out var pageStatus))
                {
                    throw new ArgumentException(
                        $"Invalid status '{status}'. Allowed values: {string.Join(", ", Enum.GetNames<PageStatus>())}.");
                }

                query = query.Where(n => n.Status == pageStatus);
            }

            if (categoryId.HasValue)
            {
                query = query.Where(n => n.CategoryId == categoryId.Value);
            }

            var totalCount = await query.CountAsync();

            query = ApplySort(query, sortBy, sortDescending);

            var items = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<EmployeeNewsItem?> GetByIdWithDetailsAsync(int id)
        {
            return await _context.EmployeeNewsItems
                .Include(n => n.Category)
                .Include(n => n.Attachments.Where(a => !a.IsDeleted))
                .FirstOrDefaultAsync(n => n.Id == id && !n.IsDeleted);
        }

        private static IQueryable<EmployeeNewsItem> ApplySort(
            IQueryable<EmployeeNewsItem> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.Trim().ToLowerInvariant()) switch
            {
                "createdat" => sortDescending
                    ? query.OrderByDescending(n => n.CreatedAt)
                    : query.OrderBy(n => n.CreatedAt),
                "publishedat" => sortDescending
                    ? query.OrderByDescending(n => n.PublishedAt ?? n.CreatedAt)
                    : query.OrderBy(n => n.PublishedAt ?? n.CreatedAt),
                "status" => sortDescending
                    ? query.OrderByDescending(n => n.Status)
                    : query.OrderBy(n => n.Status),
                "title" => sortDescending
                    ? query.OrderByDescending(n => n.Title)
                    : query.OrderBy(n => n.Title),
                "modifiedat" => sortDescending
                    ? query.OrderByDescending(n => n.ModifiedAt ?? n.CreatedAt)
                    : query.OrderBy(n => n.ModifiedAt ?? n.CreatedAt),
                _ => sortDescending
                    ? query.OrderByDescending(n => n.CreatedAt)
                    : query.OrderBy(n => n.CreatedAt)
            };
        }
    }
}
