using LinkDev.MOS.SuperApp.DataAccess.Entites.QuickLinks;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories
{
    public interface IQuickLinkRepository : IGenericRepository<QuickLink>
    {
        Task<IEnumerable<QuickLink>> GetAllOrderedAsync();
        Task<IEnumerable<QuickLink>> GetAllIncludingDeletedAsync();
    }
}
