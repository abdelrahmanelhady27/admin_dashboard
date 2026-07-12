using Linkdev.MOS.SuperApp.Business.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.DTOs.UserPermission
{
    public class UserPermissionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public FeatureType Feature { get; set; }
        public PermissionAction Permission { get; set; }
    }
}
