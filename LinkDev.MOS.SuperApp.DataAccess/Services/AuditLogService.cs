using Linkdev.MOS.SuperApp.Business.DTOs.AuditLog;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.AuditLog;
using LinkDev.MOS.SuperApp.DataAccess.Entites;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace LinkDev.MOS.SuperApp.DataAccess.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IGenericRepository<AuditLog> _repo;
        private readonly IQueryableRepository<AuditLog> _queryRepo;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(
            IGenericRepository<AuditLog> repo,
            IQueryableRepository<AuditLog> queryRepo,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor)
        {
            _repo = repo;
            _queryRepo = queryRepo;
            _unitOfWork = unitOfWork;
            _httpContextAccessor = httpContextAccessor;
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
                PerformedBy = GetCurrentUserName(),
                PerformedAt = DateTime.UtcNow
            };

            await _repo.AddAsync(entry);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<IEnumerable<AuditLogDto>> GetAllAsync(
            string? search,
            string? actionType,
            string? entityType,
            DateTime? from,
            DateTime? to)
        {
            var query = _queryRepo.GetQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(x =>
                    x.EntityName.ToLower().Contains(term) ||
                    x.PerformedBy.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(actionType) &&
                Enum.TryParse<AuditActionType>(actionType, true, out var parsedAction))
            {
                query = query.Where(x => x.ActionType == parsedAction);
            }

            if (!string.IsNullOrWhiteSpace(entityType) &&
                Enum.TryParse<AuditEntityType>(entityType, true, out var parsedEntity))
            {
                query = query.Where(x => x.EntityType == parsedEntity);
            }

            if (from.HasValue)
            {
                query = query.Where(x => x.PerformedAt >= from.Value);
            }

            if (to.HasValue)
            {
                query = query.Where(x => x.PerformedAt <= to.Value);
            }

            var items = query
                .OrderByDescending(x => x.PerformedAt)
                .ToList();

            return items.Select(x => new AuditLogDto
            {
                Id = x.Id,
                ActionType = x.ActionType.ToString(),
                EntityType = x.EntityType.ToString(),
                EntityName = x.EntityName,
                PerformedBy = x.PerformedBy,
                PerformedAt = x.PerformedAt
            });
        }

        private string GetCurrentUserName()
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user?.Identity?.IsAuthenticated != true)
            {
                return "System";
            }

            var name = user.FindFirst(ClaimTypes.Name)?.Value
                ?? user.FindFirst("name")?.Value;
            if (!string.IsNullOrWhiteSpace(name))
            {
                return name;
            }

            var email = user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("email")?.Value;
            if (!string.IsNullOrWhiteSpace(email))
            {
                return email;
            }

            return "System";
        }
    }
}
