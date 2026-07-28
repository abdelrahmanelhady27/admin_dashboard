namespace Linkdev.MOS.SuperApp.Business.DTOs.AuditLog
{
    public class AuditLogDto
    {
        public int Id { get; set; }
        public string ActionType { get; set; } = "";
        public string EntityType { get; set; } = "";
        public string EntityName { get; set; } = "";
        public string PerformedBy { get; set; } = "";
        public DateTime PerformedAt { get; set; }
    }
}
