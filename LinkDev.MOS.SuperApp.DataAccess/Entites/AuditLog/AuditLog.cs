using Linkdev.MOS.SuperApp.Business.Enums;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.AuditLog
{
    public class AuditLog
    {
        public int Id { get; set; }
        public AuditActionType ActionType { get; set; }
        public AuditEntityType EntityType { get; set; }
        public string EntityName { get; set; } = "";
        public int? EntityId { get; set; }
        public string PerformedBy { get; set; } = "";
        public DateTime PerformedAt { get; set; }
    }
}
