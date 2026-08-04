using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages
{
    public class LinkedSystem : BaseEntity
    {
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;

        public ICollection<LinkedService> Services { get; set; } = new List<LinkedService>();
    }
}
