using LinkDev.MOS.SuperApp.Domain.Common;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.Domain.Entities.QuickLinks
{
    public class QuickLink : BaseEntity
    {
        public int ServiceId { get; set; }
        public int DisplayOrder { get; set; }

        public LinkedService? Service { get; set; }
    }
}
