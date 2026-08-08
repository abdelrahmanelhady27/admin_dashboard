using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji
{
    public class NewsEmojiSearchDto : PagedRequest
    {
        public NewsEmojiSearchDto()
        {
            SortBy = "displayOrder";
            SortDescending = false;
        }

        public string? Search { get; set; }
        public bool? IsActive { get; set; }
    }
}
