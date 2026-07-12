using System.Collections.Generic;

namespace Linkdev.MOS.SuperApp.Business.DTOs.User
{
    public class CreateUserDto
    {
        public int StaticUserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public List<PermissionSetDto> Permissions { get; set; }
    }
}
