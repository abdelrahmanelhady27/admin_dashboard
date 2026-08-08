using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews
{
    public interface INewsEmojiService
    {
        Task<PagedResult<NewsEmojiDto>> GetAllAsync(NewsEmojiSearchDto request);
        Task<NewsEmojiDto?> GetByIdAsync(int id);
        Task<NewsEmojiDto> CreateAsync(CreateNewsEmojiDto dto);
        Task<NewsEmojiDto?> UpdateAsync(int id, UpdateNewsEmojiDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
