using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages
{
    public class LinkedService : BaseEntity
    {
        public int SystemId { get; set; }
        public string NameAr { get; set; } = "";
        public string NameEn { get; set; } = "";
        public string DeepLink { get; set; } = "";
        public bool IsActive { get; set; }

        public LinkedSystem? System { get; set; }
        public ServiceIntroPage? ServiceIntroPage { get; set; }
    }
}
