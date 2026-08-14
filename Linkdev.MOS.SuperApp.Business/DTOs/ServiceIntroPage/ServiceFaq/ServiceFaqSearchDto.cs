using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq
{
    public class ServiceFaqSearchDto : PagedRequest
    {
        public ServiceFaqSearchDto()
        {
            SortBy = "displayOrder";
            SortDescending = false;
        }

        public string? Search { get; set; }
        public bool? IsActive { get; set; }
    }
}
