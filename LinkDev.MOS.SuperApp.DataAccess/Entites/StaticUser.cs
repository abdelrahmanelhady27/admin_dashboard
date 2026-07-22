using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;

namespace Linkdev.MOS.SuperApp.DataAccess.Entites
{
    public class StaticUser : BaseEntity
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
