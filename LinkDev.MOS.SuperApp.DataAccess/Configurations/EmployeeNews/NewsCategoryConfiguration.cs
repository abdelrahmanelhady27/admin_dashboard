using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LinkDev.MOS.SuperApp.DataAccess.Configurations.EmployeeNews
{
    public class NewsCategoryConfiguration : IEntityTypeConfiguration<NewsCategory>
    {
        private static readonly DateTime SeedCreatedAt = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public void Configure(EntityTypeBuilder<NewsCategory> builder)
        {
            builder.ToTable("NewsCategories");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.DisplayOrder).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();

            builder.HasIndex(x => x.DisplayOrder);

            builder.HasData(
                new NewsCategory
                {
                    Id = 1,
                    Name = "Congratulations and recognition",
                    DisplayOrder = 1,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsCategory
                {
                    Id = 2,
                    Name = "Social occasions",
                    DisplayOrder = 2,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsCategory
                {
                    Id = 3,
                    Name = "Achievements and projects",
                    DisplayOrder = 3,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsCategory
                {
                    Id = 4,
                    Name = "Personal occasions",
                    DisplayOrder = 4,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                },
                new NewsCategory
                {
                    Id = 5,
                    Name = "General news",
                    DisplayOrder = 5,
                    IsActive = true,
                    CreatedAt = SeedCreatedAt,
                    CreatedBy = "System"
                });
        }
    }
}
