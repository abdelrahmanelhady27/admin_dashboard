using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;
using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages
{
    public class LinkedSystem : BaseEntity
    {
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;

        public ICollection<LinkedService> Services { get; set; } = new List<LinkedService>();
    }
}
