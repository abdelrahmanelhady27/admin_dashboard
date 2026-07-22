using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common
{
    public interface IQueryableRepository<T> : IGenericRepository<T> where T : class
    {
        IQueryable<T> GetQueryable();
    }
}