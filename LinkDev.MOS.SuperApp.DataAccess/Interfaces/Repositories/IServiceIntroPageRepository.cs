using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories
{
    public interface IServiceIntroPageRepository : IGenericRepository<ServiceIntroPage>
    {
        Task<IEnumerable<ServiceIntroPage>> GetAllWithDetailsAsync(string? search, string? status);
        Task<ServiceIntroPage?> GetByIdWithDetailsAsync(int id);
        Task<ServiceIntroPage?> GetByServiceIdAsync(int serviceId);
    }
}
