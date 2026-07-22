using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages
{
    public interface IServiceIntroPageService
    {
        Task<IEnumerable<ServiceIntroPageDto>> GetAllAsync(string? search, string? status);
        Task<ServiceIntroPageDto?> GetByIdAsync(int id);
        Task<IEnumerable<LinkedServiceDto>> GetAvailableServicesAsync();
        Task<ServiceIntroPageDto> CreateAsync(CreateServiceIntroPageDto dto);
        Task<ServiceIntroPageDto?> UpdateAsync(int id, UpdateServiceIntroPageDto dto);
        Task<ServiceIntroPageDto?> PublishAsync(int id);
        Task<ServiceIntroPageDto?> UnpublishAsync(int id);
        Task<bool> DeleteAsync(int id);
        Task<ServiceIntroPageDto?> GetPublishedByServiceIdAsync(int serviceId);
    }
}
