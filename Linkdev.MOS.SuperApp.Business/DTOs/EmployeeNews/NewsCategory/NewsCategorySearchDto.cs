using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory
{
    public class NewsCategorySearchDto : PagedRequest
    {
        public NewsCategorySearchDto()
        {
            SortBy = "displayOrder";
            SortDescending = false;
        }

        public string? Search { get; set; }
        public bool? IsActive { get; set; }
    }
}
