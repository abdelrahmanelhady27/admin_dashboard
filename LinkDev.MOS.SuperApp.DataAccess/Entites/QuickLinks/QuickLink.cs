using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;
using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.QuickLinks
{
    public class QuickLink : BaseEntity
    {
        public int ServiceId { get; set; }
        public int DisplayOrder { get; set; }

        public LinkedService? Service { get; set; }
    }
}
