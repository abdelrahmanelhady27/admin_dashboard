using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages
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
