using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;
using Linkdev.MOS.SuperApp.Identity.Entites;
using LinkDev.MOS.SuperApp.DataAccess.Entites;
using LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.DataAccess.DbContexts
{
    public class AdminDbContext : DbContext
    {
        public AdminDbContext(DbContextOptions<AdminDbContext> options) : base(options) { }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.ToTable("AspNetUsers", t => t.ExcludeFromMigrations());
            });
            modelBuilder.Entity<UnregisteredStaticUser>(entity =>
            {
                entity.ToView("vw_UnregisteredStaticUsers");
                entity.HasKey(e => e.Id);
            });
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AdminDbContext).Assembly);
        }

        public override int SaveChanges()
        {
            UpdateBaseEntityFields();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateBaseEntityFields();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateBaseEntityFields()
        {
            var entries = ChangeTracker.Entries();
            foreach (var entry in entries)
            {
                if (entry.Entity is BaseEntity baseEntity)
                {
                    if (entry.State == EntityState.Added)
                    {
                        baseEntity.CreatedAt = DateTime.UtcNow;
                        baseEntity.CreatedBy = string.IsNullOrWhiteSpace(baseEntity.CreatedBy) ? "Super Admin" : baseEntity.CreatedBy;
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        baseEntity.ModifiedAt = DateTime.UtcNow;
                        baseEntity.ModifiedBy = string.IsNullOrWhiteSpace(baseEntity.ModifiedBy) ? "SuperAdmin" : baseEntity.ModifiedBy;
                    }
                }
                else if (entry.Entity is ApplicationUser appUser)
                {
                    if (entry.State == EntityState.Added)
                    {
                        appUser.CreatedAt = DateTime.UtcNow;
                        appUser.CreatedBy = string.IsNullOrWhiteSpace(appUser.CreatedBy) ? "SuperAdmin" : appUser.CreatedBy;
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        appUser.ModifiedAt = DateTime.UtcNow;
                        appUser.ModifiedBy = string.IsNullOrWhiteSpace(appUser.ModifiedBy) ? "SuperAdmin" : appUser.ModifiedBy;
                    }
                }
            }
        }

        public DbSet<UserPermission> UserPermissions { get; set; }
        public DbSet<StaticUser> StaticUsers { get; set; }
        public DbSet<UnregisteredStaticUser> UnregisteredStaticUsers { get; set; }
        public DbSet<ApplicationUser> Users { get; set; }
        public DbSet<LinkedSystem> LinkedSystems { get; set; }
        public DbSet<LinkedService> LinkedServices { get; set; }
        public DbSet<ServiceIntroPage> ServiceIntroPages { get; set; }
        public DbSet<ServiceDocument> ServiceDocuments { get; set; }
        public DbSet<ServiceFaq> ServiceFaqs { get; set; }
        public DbSet<AvailableLinkedService> AvailableLinkedServices { get; set; }
    }
}
