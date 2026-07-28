using Linkdev.MOS.SuperApp.Business.DTOs.AuditLog;
using Linkdev.MOS.SuperApp.Business.Enums;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.AuditLog
{
    public interface IAuditLogService
    {
        Task LogAsync(AuditActionType actionType, AuditEntityType entityType, string entityName, int? entityId = null);
        Task<IEnumerable<AuditLogDto>> GetAllAsync(string? search, string? actionType, string? entityType, DateTime? from, DateTime? to);
    }
}
