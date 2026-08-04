using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;

namespace LinkDev.MOS.SuperApp.DataAccess.Common
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AdminDbContext _context;

        public UnitOfWork(AdminDbContext context)
        {
            _context = context;
        }

        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
