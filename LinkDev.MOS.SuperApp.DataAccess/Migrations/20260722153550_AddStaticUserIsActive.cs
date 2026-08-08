using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LinkDev.MOS.SuperApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddStaticUserIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "StaticUsers",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[dbo].[vw_UnregisteredStaticUsers]', N'V') IS NOT NULL
    DROP VIEW [dbo].[vw_UnregisteredStaticUsers];
");

            migrationBuilder.Sql(@"
CREATE VIEW [dbo].[vw_UnregisteredStaticUsers] AS
SELECT
    s.[Id],
    s.[FullName],
    s.[Email],
    s.[IsActive],
    s.[IsDeleted],
    s.[CreatedAt],
    s.[CreatedBy],
    s.[ModifiedAt],
    s.[ModifiedBy]
FROM [dbo].[StaticUsers] s
LEFT JOIN [dbo].[AspNetUsers] u ON s.[Id] = u.[StaticUserId]
WHERE u.[StaticUserId] IS NULL AND s.[IsDeleted] = 0;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[dbo].[vw_UnregisteredStaticUsers]', N'V') IS NOT NULL
    DROP VIEW [dbo].[vw_UnregisteredStaticUsers];
");

            migrationBuilder.Sql(@"
CREATE VIEW [dbo].[vw_UnregisteredStaticUsers] AS
SELECT
    s.[Id],
    s.[FullName],
    s.[Email],
    s.[IsDeleted],
    s.[CreatedAt],
    s.[CreatedBy],
    s.[ModifiedAt],
    s.[ModifiedBy]
FROM [dbo].[StaticUsers] s
LEFT JOIN [dbo].[AspNetUsers] u ON s.[Id] = u.[StaticUserId]
WHERE u.[StaticUserId] IS NULL AND s.[IsDeleted] = 0;
");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "StaticUsers");
        }
    }
}
