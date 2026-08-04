using LinkDev.MOS.SuperApp.Business.DTOs.AuditLogs;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs
{
    public interface IAuditLogService
    {
        Task LogAsync(AuditActionType actionType, AuditEntityType entityType, string entityName, int? entityId = null);
        Task<IEnumerable<AuditLogDto>> GetAllAsync(string? search, string? actionType, string? entityType, DateTime? from, DateTime? to);
    }
}
