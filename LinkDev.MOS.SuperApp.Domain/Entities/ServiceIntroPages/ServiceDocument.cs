using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages
{
    public class ServiceDocument : BaseEntity
    {
        public int ServiceIntroPageId { get; set; }
        public string Name { get; set; } = "";
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }

        public ServiceIntroPage? ServiceIntroPage { get; set; }
    }
}
