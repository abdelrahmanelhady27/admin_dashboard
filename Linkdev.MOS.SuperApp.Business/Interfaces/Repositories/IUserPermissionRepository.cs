using Linkdev.MOS.SuperApp.Business.Entites;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IUserPermissionRepository : IGenericRepository<UserPermission>
    {
        IEnumerable<UserPermission> GetAllByUserId(int userId);
    }
}
