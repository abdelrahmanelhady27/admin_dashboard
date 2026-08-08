using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LinkDev.MOS.SuperApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceIntroPages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LinkedSystems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedSystems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LinkedServices",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SystemId = table.Column<int>(type: "int", nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DeepLink = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkedServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LinkedServices_LinkedSystems_SystemId",
                        column: x => x.SystemId,
                        principalTable: "LinkedSystems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceIntroPages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(190)", maxLength: 190, nullable: false),
                    ProcessingDuration = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    VideoUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    VideoFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    PublishedSnapshotJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceIntroPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceIntroPages_LinkedServices_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "LinkedServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceIntroPageId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    FileType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceDocuments_ServiceIntroPages_ServiceIntroPageId",
                        column: x => x.ServiceIntroPageId,
                        principalTable: "ServiceIntroPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceFaqs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceIntroPageId = table.Column<int>(type: "int", nullable: false),
                    Question = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceFaqs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceFaqs_ServiceIntroPages_ServiceIntroPageId",
                        column: x => x.ServiceIntroPageId,
                        principalTable: "ServiceIntroPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "LinkedSystems",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "IsDeleted", "ModifiedAt", "ModifiedBy", "NameAr", "NameEn" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", false, null, null, "النظام أ", "System A" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", false, null, null, "النظام ب", "System B" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", false, null, null, "النظام ج", "System C" }
                });

            migrationBuilder.InsertData(
                table: "LinkedServices",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "DeepLink", "IsActive", "IsDeleted", "ModifiedAt", "ModifiedBy", "NameAr", "NameEn", "SystemId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-a/service-a1", true, false, null, null, "خدمة أ1", "Service A1", 1 },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-a/service-a2", true, false, null, null, "خدمة أ2", "Service A2", 1 },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "", false, false, null, null, "خدمة أ3", "Service A3", 1 },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-b/service-b1", true, false, null, null, "خدمة ب1", "Service B1", 2 },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-b/service-b2", false, false, null, null, "خدمة ب2", "Service B2", 2 },
                    { 6, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-b/service-b3", true, false, null, null, "خدمة ب3", "Service B3", 2 },
                    { 7, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-c/service-c1", true, false, null, null, "خدمة ج1", "Service C1", 3 },
                    { 8, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "app://system-c/service-c2", true, false, null, null, "خدمة ج2", "Service C2", 3 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_LinkedServices_SystemId",
                table: "LinkedServices",
                column: "SystemId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceDocuments_ServiceIntroPageId",
                table: "ServiceDocuments",
                column: "ServiceIntroPageId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFaqs_ServiceIntroPageId",
                table: "ServiceFaqs",
                column: "ServiceIntroPageId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceIntroPages_ServiceId",
                table: "ServiceIntroPages",
                column: "ServiceId",
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.Sql(@"
CREATE VIEW [dbo].[vw_AvailableLinkedServices] AS
SELECT
    s.[Id],
    s.[SystemId],
    s.[NameAr],
    s.[NameEn],
    s.[DeepLink],
    s.[IsActive],
    s.[CreatedAt],
    s.[CreatedBy],
    s.[ModifiedAt],
    s.[ModifiedBy],
    s.[IsDeleted],
    sys.[NameAr] AS [SystemNameAr],
    sys.[NameEn] AS [SystemNameEn]
FROM [dbo].[LinkedServices] s
INNER JOIN [dbo].[LinkedSystems] sys ON s.[SystemId] = sys.[Id]
LEFT JOIN [dbo].[ServiceIntroPages] p ON p.[ServiceId] = s.[Id] AND p.[IsDeleted] = 0
WHERE s.[IsActive] = 1
  AND s.[IsDeleted] = 0
  AND sys.[IsDeleted] = 0
  AND p.[Id] IS NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP VIEW IF EXISTS [dbo].[vw_AvailableLinkedServices];");

            migrationBuilder.DropTable(
                name: "ServiceDocuments");

            migrationBuilder.DropTable(
                name: "ServiceFaqs");

            migrationBuilder.DropTable(
                name: "ServiceIntroPages");

            migrationBuilder.DropTable(
                name: "LinkedServices");

            migrationBuilder.DropTable(
                name: "LinkedSystems");
        }
    }
}
