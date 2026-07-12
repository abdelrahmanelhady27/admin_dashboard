using Linkdev.MOS.SuperApp.Identity.Entites;
using LinkDev.MOS.SuperApp.Utility.Interfaces;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.Identity.DbContexts
{
    public class AppIdentityDbContext : IdentityDbContext <ApplicationUser, ApplicationRole, int> 
    {
        public AppIdentityDbContext(DbContextOptions<AppIdentityDbContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public override int SaveChanges()
        {
            UpdateAuditFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateAuditFields()
        {
            foreach (var entry in ChangeTracker.Entries<IAuditableEntity>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.CreatedBy = string.IsNullOrWhiteSpace(entry.Entity.CreatedBy) ? "Super Admin" : entry.Entity.CreatedBy;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.ModifiedAt = DateTime.UtcNow;
                    entry.Entity.ModifiedBy = string.IsNullOrWhiteSpace(entry.Entity.ModifiedBy) ? "Super Admin" : entry.Entity.ModifiedBy;
                }
            }
        }
    }
}
