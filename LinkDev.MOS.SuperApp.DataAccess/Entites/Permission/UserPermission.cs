using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;
using Linkdev.MOS.SuperApp.Business.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.Permission
{
    public class UserPermission : BaseEntity
    {
        public FeatureType Feature { get; set; }
        public PermissionAction Permission { get; set; }

        // Relationships
        public int UserId { get; set; }

    }
}
