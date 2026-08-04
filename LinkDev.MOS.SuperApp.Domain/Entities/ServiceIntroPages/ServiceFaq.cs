using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages
{
    public class ServiceFaq : BaseEntity
    {
        public int ServiceIntroPageId { get; set; }
        public string Question { get; set; } = "";
        public string Answer { get; set; } = "";

        public ServiceIntroPage? ServiceIntroPage { get; set; }
    }
}
