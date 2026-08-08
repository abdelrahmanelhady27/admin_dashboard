using LinkDev.MOS.SuperApp.Business.DTOs.AuditLogs;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs
{
    public interface IAuditLogService
    {
        Task LogAsync(AuditActionType actionType, AuditEntityType entityType, string entityName, int? entityId = null);
        Task<PagedResult<AuditLogDto>> GetAllAsync(AuditLogSearchDto request);
    }
}
