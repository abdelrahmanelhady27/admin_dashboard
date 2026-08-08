using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.DTOs.AuditLogs
{
    public class AuditLogSearchDto : PagedRequest
    {
        public string? Search { get; set; }
        public string? ActionType { get; set; }
        public string? EntityType { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
    }
}
