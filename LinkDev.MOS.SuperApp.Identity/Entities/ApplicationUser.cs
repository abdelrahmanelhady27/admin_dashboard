using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Identity.Entities
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string? FullName { get; set; }
        public bool IsActive { get; set; }
    }
}
