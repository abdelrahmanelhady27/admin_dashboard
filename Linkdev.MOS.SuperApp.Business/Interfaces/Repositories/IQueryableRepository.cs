
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IQueryableRepository<T> : IGenericRepository<T> where T : class
    {
        IQueryable<T> GetQueryable();
    }
}