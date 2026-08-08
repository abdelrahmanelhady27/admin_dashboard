using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews
{
    public class EmployeeNewsSearchDto : PagedRequest
    {
        public string? Search { get; set; }
        public string? Status { get; set; }
        public int? CategoryId { get; set; }
    }
}
