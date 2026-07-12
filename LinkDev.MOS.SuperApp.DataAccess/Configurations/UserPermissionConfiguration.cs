using Linkdev.MOS.SuperApp.Business.Entites;
using Linkdev.MOS.SuperApp.Business.Entites.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations
{
    public class UserPermissionConfiguration : IEntityTypeConfiguration<UserPermission>
    {
        public void Configure(EntityTypeBuilder<UserPermission> builder)
        {
            builder.ToTable("UserPermissions");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.UserId)
                   .IsRequired();

            builder.HasOne<ApplicationUser>()
            .WithMany(u => u.UserPermissions)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
