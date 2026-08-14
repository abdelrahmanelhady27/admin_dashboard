using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages
{
    public class ServiceIntroPageFaq : BaseEntity
    {
        public int ServiceIntroPageId { get; set; }
        public int FaqId { get; set; }

        public ServiceIntroPage? ServiceIntroPage { get; set; }
        public ServiceFaq? Faq { get; set; }
    }
}
