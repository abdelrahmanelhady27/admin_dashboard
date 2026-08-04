using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.Permission;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Repositories
{
    public interface IUserPermissionRepository : IGenericRepository<UserPermission>
    {
        IEnumerable<UserPermission> GetAllByUserId(int userId);
    }
}
