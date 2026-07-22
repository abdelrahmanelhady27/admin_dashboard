using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Security.AccessControl;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.Common
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
