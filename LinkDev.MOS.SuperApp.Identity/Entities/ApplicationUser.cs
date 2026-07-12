using LinkDev.MOS.SuperApp.Utility.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Identity.Entites
{
    public class ApplicationUser : IdentityUser<int>, IAuditableEntity
    {
        public string? FullName { get; set; }
        public bool IsActive { get; set; }
        public int StaticUserId { get; set; }

        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
        public bool IsDeleted { get; set; }
    }
}
