using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Repositories.Common
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
