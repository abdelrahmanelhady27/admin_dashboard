using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews
{
    public interface IEmployeeNewsService
    {
        Task<PagedResult<EmployeeNewsDto>> GetAllAsync(EmployeeNewsSearchDto request);
        Task<EmployeeNewsDto?> GetByIdAsync(int id);
        Task<EmployeeNewsDto> CreateAsync(CreateEmployeeNewsDto dto);
        Task<EmployeeNewsDto?> UpdateAsync(int id, UpdateEmployeeNewsDto dto);
        Task<EmployeeNewsDto?> PublishAsync(int id);
        Task<EmployeeNewsDto?> UnpublishAsync(int id);
        Task<bool> DeleteAsync(int id);
    }
}
