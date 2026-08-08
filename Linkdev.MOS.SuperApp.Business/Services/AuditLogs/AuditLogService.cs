using LinkDev.MOS.SuperApp.Business.DTOs.AuditLogs;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Domain.Entities.AuditLog;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Services.AuditLogs
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _repo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUser _currentUser;

        public AuditLogService(
            IAuditLogRepository repo,
            IUnitOfWork unitOfWork,
            ICurrentUser currentUser)
        {
            _repo = repo;
            _unitOfWork = unitOfWork;
            _currentUser = currentUser;
        }

        public async Task LogAsync(
            AuditActionType actionType,
            AuditEntityType entityType,
            string entityName,
            int? entityId = null)
        {
            var entry = new AuditLog
            {
                ActionType = actionType,
                EntityType = entityType,
                EntityName = entityName ?? string.Empty,
                EntityId = entityId,
                PerformedBy = _currentUser.DisplayName,
                PerformedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<PagedResult<AuditLogDto>> GetAllAsync(AuditLogSearchDto request)
        {
            var (items, totalCount) = await _repo.SearchAsync(
                request.Search,
                request.ActionType,
                request.EntityType,
                request.From,
                request.To,
                request.PageNumber,
                request.PageSize,
                request.SortBy,
                request.SortDescending);

            return new PagedResult<AuditLogDto>
            {
                Items = items.Select(x => new AuditLogDto
                {
                    Id = x.Id,
                    ActionType = x.ActionType.ToString(),
                    EntityType = x.EntityType.ToString(),
                    EntityName = x.EntityName,
                    PerformedBy = x.PerformedBy,
                    PerformedAt = x.PerformedAt
                }).ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
    }
}
