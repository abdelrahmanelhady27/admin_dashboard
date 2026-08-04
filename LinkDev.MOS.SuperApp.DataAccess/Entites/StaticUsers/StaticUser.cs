using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.StaticUsers
{
    public class StaticUser : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
