using LinkDev.MOS.SuperApp.Domain.Common;
using Linkdev.MOS.SuperApp.Identity.Entites;
using LinkDev.MOS.SuperApp.Domain.Entities.AuditLog;
using LinkDev.MOS.SuperApp.Domain.Entities.Permission;
using LinkDev.MOS.SuperApp.Domain.Entities.QuickLinks;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Domain.Entities.StaticUsers;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.DataAccess.DbContexts
{
    public class AdminDbContext : DbContext
    {
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public AdminDbContext(
            DbContextOptions<AdminDbContext> options,
            IHttpContextAccessor? httpContextAccessor = null) : base(options)
        {
            _httpContextAccessor = httpContextAccessor;
        }

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
            ApplyUtcDateTimeConversion(modelBuilder);
        }

        private static void ApplyUtcDateTimeConversion(ModelBuilder modelBuilder)
        {
            var utcConverter = new ValueConverter<DateTime, DateTime>(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var nullableUtcConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                        property.SetValueConverter(utcConverter);
                    else if (property.ClrType == typeof(DateTime?))
                        property.SetValueConverter(nullableUtcConverter);
                }
            }
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
            var currentUser = GetCurrentUserName();
            var entries = ChangeTracker.Entries();
            foreach (var entry in entries)
            {
                if (entry.Entity is BaseEntity baseEntity)
                {
                    if (entry.State == EntityState.Added)
                    {
                        baseEntity.CreatedAt = DateTime.UtcNow;
                        baseEntity.CreatedBy = string.IsNullOrWhiteSpace(baseEntity.CreatedBy) ? currentUser : baseEntity.CreatedBy;
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        baseEntity.ModifiedAt = DateTime.UtcNow;
                        baseEntity.ModifiedBy = currentUser;
                    }
                }
                else if (entry.Entity is ApplicationUser appUser)
                {
                    if (entry.State == EntityState.Added)
                    {
                        appUser.CreatedAt = DateTime.UtcNow;
                        appUser.CreatedBy = string.IsNullOrWhiteSpace(appUser.CreatedBy) ? currentUser : appUser.CreatedBy;
                    }
                    else if (entry.State == EntityState.Modified)
                    {
                        appUser.ModifiedAt = DateTime.UtcNow;
                        appUser.ModifiedBy = currentUser;
                    }
                }
            }
        }

        private string GetCurrentUserName()
        {
            var user = _httpContextAccessor?.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return "System";
            }

            var name = user.FindFirst(ClaimTypes.Name)?.Value
                ?? user.FindFirst("name")?.Value;
            if (!string.IsNullOrWhiteSpace(name))
            {
                return name;
            }

            var email = user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("email")?.Value;
            if (!string.IsNullOrWhiteSpace(email))
            {
                return email;
            }

            return "System";
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
        public DbSet<QuickLink> QuickLinks { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
    }
}
