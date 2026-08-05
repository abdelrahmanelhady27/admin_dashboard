using System;

namespace Linkdev.MOS.SuperApp.Identity.Entites
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string TokenHash { get; set; }
        public int UserId { get; set; }
        public ApplicationUser User { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? ReplacedByTokenHash { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
