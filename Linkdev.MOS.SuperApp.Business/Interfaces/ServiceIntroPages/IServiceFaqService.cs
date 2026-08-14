using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages
{
    public interface IServiceFaqService
    {
        Task<PagedResult<ServiceFaqDto>> GetAllAsync(ServiceFaqSearchDto request);
        Task<ServiceFaqDto?> GetByIdAsync(int id);
        Task<ServiceFaqDto> CreateAsync(CreateServiceFaqDto dto);
        Task<ServiceFaqDto?> UpdateAsync(int id, UpdateServiceFaqDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
