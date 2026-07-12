using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class UserPermissionRepository : IUserPermissionRepository
    {
        private readonly AdminDbContext _context;
        public UserPermissionRepository(AdminDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(UserPermission entity)
        {
            await _context.Set<UserPermission>().AddAsync(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.Set<UserPermission>().FindAsync(id);
            if (entity != null) _context.Set<UserPermission>().Remove(entity);
        }

        public async Task<IEnumerable<UserPermission>> GetAllAsync()
        {
            return await _context.Set<UserPermission>().ToListAsync(); ;
        }

        public IEnumerable<UserPermission> GetAllByUserId(int userId)
        {
            return _context.UserPermissions.Where(p => p.UserId == userId).ToList();
        }

        public async Task<UserPermission> GetByIdAsync(int id)
        {
            return await _context.Set<UserPermission>().FindAsync(id);
        }

        public void Update(UserPermission entity)
        {
            _context.Set<UserPermission>().Update(entity);
        }
    }
}
