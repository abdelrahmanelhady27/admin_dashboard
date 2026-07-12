using Linkdev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories
{
    public class QueryableRepository<T> : GenericRepository<T>, IQueryableRepository<T> where T : class
    {
        public QueryableRepository(AdminDbContext context) : base(context) { }

        public IQueryable<T> GetQueryable()
        {
            return _context.Set<T>().AsQueryable();
        }
    }
}
