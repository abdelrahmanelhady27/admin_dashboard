using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages
{
    public class ServiceFaq : BaseEntity
    {
        public string Question { get; set; } = "";
        public string Answer { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<ServiceIntroPageFaq> PageFaqs { get; set; } = new List<ServiceIntroPageFaq>();
    }
}
