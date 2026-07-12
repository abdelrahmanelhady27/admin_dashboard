using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LinkDev.MOS.SuperApp.Identity.Migrations
{
    /// <inheritdoc />
    public partial class UpdateApplicationUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserPermissionId",
                table: "AspNetUsers",
                newName: "StaticUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "StaticUserId",
                table: "AspNetUsers",
                newName: "UserPermissionId");
        }
    }
}
