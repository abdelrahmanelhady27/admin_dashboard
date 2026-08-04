using System;
using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.User
{
    public class UserDto
    {
        public int Id { get; set; }
        public int StaticUserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Status { get; set; }
        public List<PermissionSetDto> Permissions { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
