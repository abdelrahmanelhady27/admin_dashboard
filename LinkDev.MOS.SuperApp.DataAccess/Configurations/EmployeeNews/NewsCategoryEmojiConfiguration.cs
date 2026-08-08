using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.EmployeeNews
{
    public class NewsCategoryEmojiConfiguration : IEntityTypeConfiguration<NewsCategoryEmoji>
    {
        private static readonly DateTime SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public void Configure(EntityTypeBuilder<NewsCategoryEmoji> builder)
        {
            builder.ToTable("NewsCategoryEmojis");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.CategoryId).IsRequired();
            builder.Property(x => x.EmojiId).IsRequired();

            builder.HasOne(x => x.Category)
                   .WithMany(x => x.CategoryEmojis)
                   .HasForeignKey(x => x.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Emoji)
                   .WithMany(x => x.CategoryEmojis)
                   .HasForeignKey(x => x.EmojiId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.CategoryId, x.EmojiId })
                   .IsUnique()
                   .HasFilter("[IsDeleted] = 0");

            // Default: all 5 emojis on each of the 5 seed categories
            var seeds = new List<NewsCategoryEmoji>();
            var id = 1;
            for (var categoryId = 1; categoryId <= 5; categoryId++)
            {
                for (var emojiId = 1; emojiId <= 5; emojiId++)
                {
                    seeds.Add(new NewsCategoryEmoji
                    {
                        Id = id++,
                        CategoryId = categoryId,
                        EmojiId = emojiId,
                        CreatedAt = SeedCreatedAt,
                        CreatedBy = "System"
                    });
                }
            }

            builder.HasData(seeds);
        }
    }
}
