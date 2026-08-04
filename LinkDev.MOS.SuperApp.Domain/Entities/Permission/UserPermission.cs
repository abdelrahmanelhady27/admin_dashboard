using LinkDev.MOS.SuperApp.Domain.Common;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Domain.Entities.Permission
{
    public class UserPermission : BaseEntity
    {
        public FeatureType Feature { get; set; }
        public PermissionAction Permission { get; set; }

        // Relationships
        public int UserId { get; set; }
    }
}
