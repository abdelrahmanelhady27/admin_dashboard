using Linkdev.MOS.SuperApp.Business.Entites.Common;
using Linkdev.MOS.SuperApp.Business.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Entites
{
    public class UserPermission : BaseEntity
    {
        public FeatureType Feature { get; set; }
        public PermissionAction Permission { get; set; }

        // Relationships
        public int UserId { get; set; }

    }
}
