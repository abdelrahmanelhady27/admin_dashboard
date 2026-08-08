using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.User
{
    public class UserSearchDto : PagedRequest
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public string? ContentType { get; set; }
    }
}
