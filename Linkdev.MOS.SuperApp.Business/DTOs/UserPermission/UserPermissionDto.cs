using LinkDev.MOS.SuperApp.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Business.DTOs.UserPermission
{
    public class UserPermissionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public FeatureType Feature { get; set; }
        public PermissionAction Permission { get; set; }
    }
}
