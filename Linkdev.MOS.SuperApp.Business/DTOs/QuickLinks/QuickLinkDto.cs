using System;

namespace LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks
{
    public class QuickLinkDto
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public int SystemId { get; set; }
        public string ServiceNameAr { get; set; } = "";
        public string ServiceNameEn { get; set; } = "";
        public string SystemNameAr { get; set; } = "";
        public string SystemNameEn { get; set; } = "";
        public string DeepLink { get; set; } = "";
        public int DisplayOrder { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
