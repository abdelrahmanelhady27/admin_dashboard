using LinkDev.MOS.SuperApp.Identity.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Identity.DbContexts
{
    public class AppIdentityDbContext : IdentityDbContext <ApplicationUser, ApplicationRole, int> 
    {
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options) : base(options) { }
    }
}
