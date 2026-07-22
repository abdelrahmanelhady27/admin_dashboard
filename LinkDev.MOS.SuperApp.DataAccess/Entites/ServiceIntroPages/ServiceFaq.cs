using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages
{
    public class ServiceFaq : BaseEntity
    {
        public int ServiceIntroPageId { get; set; }
        public string Question { get; set; } = "";
        public string Answer { get; set; } = "";

        public ServiceIntroPage? ServiceIntroPage { get; set; }
    }
}
