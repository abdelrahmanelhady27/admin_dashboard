using Linkdev.MOS.SuperApp.DataAccess.Entites;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories
{
    public interface IUserPermissionRepository : IGenericRepository<UserPermission>
    {
        IEnumerable<UserPermission> GetAllByUserId(int userId);
    }
}
