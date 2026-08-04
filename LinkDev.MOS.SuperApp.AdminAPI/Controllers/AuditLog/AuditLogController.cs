using LinkDev.MOS.SuperApp.Business.DTOs.AuditLogs;
using LinkDev.MOS.SuperApp.Domain.Enums;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.AuditLog
{
    [Route("api/audit-log")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.AuditLog)]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;

        public AuditLogController(IAuditLogService auditLogService)
        {
            _auditLogService = auditLogService;
        }

        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? actionType,
            [FromQuery] string? entityType,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            try
            {
                var logs = await _auditLogService.GetAllAsync(search, actionType, entityType, from, to);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
