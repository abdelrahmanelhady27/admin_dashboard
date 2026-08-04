using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage
{
    public class CreateServiceIntroPageDto
    {
        public int ServiceId { get; set; }

        public string Description { get; set; } = string.Empty;

        public string ProcessingDuration { get; set; } = string.Empty;

        public string? VideoUrl { get; set; }
        public string? VideoFileName { get; set; }

        public List<ServiceDocumentDto> Documents { get; set; } = new();
        public List<ServiceFaqDto> Faqs { get; set; } = new();

        public bool Publish { get; set; }
    }
}
