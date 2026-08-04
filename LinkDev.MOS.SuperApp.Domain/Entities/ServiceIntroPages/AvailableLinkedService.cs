using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages
{
    public class AvailableLinkedService : BaseEntity
    {
        public int SystemId { get; set; }
        public string NameAr { get; set; } = "";
        public string NameEn { get; set; } = "";
        public string DeepLink { get; set; } = "";
        public bool IsActive { get; set; }
        public string SystemNameAr { get; set; } = "";
        public string SystemNameEn { get; set; } = "";
    }
}
