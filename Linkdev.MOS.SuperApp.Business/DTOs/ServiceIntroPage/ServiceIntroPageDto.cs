using System;
using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage
{
    public class ServiceIntroPageDto
    {
        public int Id { get; set; }
        public int ServiceId { get; set; }
        public string ServiceNameAr { get; set; } = "";
        public string ServiceNameEn { get; set; } = "";
        public string Status { get; set; } = "";
        public string Description { get; set; } = "";
        public string ProcessingDuration { get; set; } = "";
        public string? VideoUrl { get; set; }
        public string? VideoFileName { get; set; }
        public List<ServiceDocumentDto> Documents { get; set; } = new();
        public List<ServiceFaqDto> Faqs { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? PublishedAt { get; set; }
    }
}
