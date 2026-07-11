using Linkdev.MOS.SuperApp.Business.Entites;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.AccessControl;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AdminDbContext _context;

        public IGenericRepository<UserPermission> UserPermissions { get; }
        public UnitOfWork(AdminDbContext context)
        {
            _context = context;
            UserPermissions = new GenericRepository<UserPermission>(_context);
        }
        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    }
}
