using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Interfaces
{
    public interface IUnitOfWork
    {
        Task<int> SaveChangesAsync();
    }
}
