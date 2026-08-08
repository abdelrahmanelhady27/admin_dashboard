using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage
{
    public class ServiceIntroPageSearchDto : PagedRequest
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
    }
}
