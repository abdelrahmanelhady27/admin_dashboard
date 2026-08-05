using Linkdev.MOS.SuperApp.Identity.Entites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.Identity.Configurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.TokenHash)
                   .IsRequired()
                   .HasMaxLength(128);

            builder.Property(x => x.ReplacedByTokenHash)
                   .HasMaxLength(128);

            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.ExpiresAt).IsRequired();

            builder.HasOne(x => x.User)
                   .WithMany()
                   .HasForeignKey(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.TokenHash).IsUnique();
            builder.HasIndex(x => x.UserId);

            builder.Ignore(x => x.IsExpired);
            builder.Ignore(x => x.IsRevoked);
            builder.Ignore(x => x.IsActive);
        }
    }
}
