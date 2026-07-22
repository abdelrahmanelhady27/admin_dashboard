using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common
{
    public interface IGenericRepository<T> where T: class
    {
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task AddAsync(T entity);
        void Update(T entity);
        Task DeleteAsync(int id);
    }
}
