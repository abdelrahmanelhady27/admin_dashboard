using System;

namespace Linkdev.MOS.SuperApp.Business.DTOs.User
{
    public class UserAccountDto
    {
        public int Id { get; set; }
        public int StaticUserId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
