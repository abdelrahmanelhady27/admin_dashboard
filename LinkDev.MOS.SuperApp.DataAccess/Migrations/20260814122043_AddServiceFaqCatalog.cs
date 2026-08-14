using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LinkDev.MOS.SuperApp.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceFaqCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceFaqs_ServiceIntroPages_ServiceIntroPageId",
                table: "ServiceFaqs");

            migrationBuilder.RenameColumn(
                name: "ServiceIntroPageId",
                table: "ServiceFaqs",
                newName: "DisplayOrder");

            migrationBuilder.RenameIndex(
                name: "IX_ServiceFaqs_ServiceIntroPageId",
                table: "ServiceFaqs",
                newName: "IX_ServiceFaqs_DisplayOrder");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ServiceFaqs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "ServiceIntroPageFaqs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceIntroPageId = table.Column<int>(type: "int", nullable: false),
                    FaqId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceIntroPageFaqs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceIntroPageFaqs_ServiceFaqs_FaqId",
                        column: x => x.FaqId,
                        principalTable: "ServiceFaqs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceIntroPageFaqs_ServiceIntroPages_ServiceIntroPageId",
                        column: x => x.ServiceIntroPageId,
                        principalTable: "ServiceIntroPages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceIntroPageFaqs_FaqId",
                table: "ServiceIntroPageFaqs",
                column: "FaqId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceIntroPageFaqs_ServiceIntroPageId_FaqId",
                table: "ServiceIntroPageFaqs",
                columns: new[] { "ServiceIntroPageId", "FaqId" },
                unique: true,
                filter: "[IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceIntroPageFaqs");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ServiceFaqs");

            migrationBuilder.RenameColumn(
                name: "DisplayOrder",
                table: "ServiceFaqs",
                newName: "ServiceIntroPageId");

            migrationBuilder.RenameIndex(
                name: "IX_ServiceFaqs_DisplayOrder",
                table: "ServiceFaqs",
                newName: "IX_ServiceFaqs_ServiceIntroPageId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceFaqs_ServiceIntroPages_ServiceIntroPageId",
                table: "ServiceFaqs",
                column: "ServiceIntroPageId",
                principalTable: "ServiceIntroPages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
