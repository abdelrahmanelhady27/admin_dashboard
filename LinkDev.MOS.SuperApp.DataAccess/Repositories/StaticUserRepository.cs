using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.Domain.Entities.StaticUsers;
using Microsoft.EntityFrameworkCore;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class StaticUserRepository : IStaticUserRepository
    {
        private readonly AdminDbContext _context;

        public StaticUserRepository(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<StaticUser?> GetByIdAsync(int id)
        {
            return await _context.StaticUsers.FindAsync(id);
        }

        public async Task<IEnumerable<UnregisteredStaticUser>> SearchUnregisteredAsync(string term)
        {
            var termLower = term.ToLower();
            return await _context.UnregisteredStaticUsers
                .AsNoTracking()
                .Where(u => u.FullName.ToLower().Contains(termLower) || u.Email.ToLower().Contains(termLower))
                .ToListAsync();
        }
    }
}
