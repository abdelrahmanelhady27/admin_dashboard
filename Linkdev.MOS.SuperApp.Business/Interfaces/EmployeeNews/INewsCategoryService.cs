using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews
{
    public interface INewsCategoryService
    {
        Task<PagedResult<NewsCategoryDto>> GetAllAsync(NewsCategorySearchDto request);
        Task<NewsCategoryDto?> GetByIdAsync(int id);
        Task<NewsCategoryDto> CreateAsync(CreateNewsCategoryDto dto);
        Task<NewsCategoryDto?> UpdateAsync(int id, UpdateNewsCategoryDto dto);
        Task<NewsCategoryDto?> SaveEmojisAsync(int id, SaveCategoryEmojisDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
