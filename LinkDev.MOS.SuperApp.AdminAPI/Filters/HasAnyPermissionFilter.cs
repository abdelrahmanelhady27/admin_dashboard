using LinkDev.MOS.SuperApp.Business.Interfaces.Permissions;
using LinkDev.MOS.SuperApp.Domain.Constants;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    public class HasAnyPermissionFilter : IAsyncAuthorizationFilter
    {
        private readonly PermissionAction[] _permissions;
        private readonly IPermissionService _permissionService;

        public HasAnyPermissionFilter(PermissionAction[] permissions, IPermissionService permissionService)
        {
            _permissions = permissions ?? [];
            _permissionService = permissionService;
        }

        public Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var user = context.HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return Task.CompletedTask;
            }

            var featureAttribute = context.ActionDescriptor.EndpointMetadata
                .OfType<HasFeatureAttribute>()
                .FirstOrDefault();

            if (featureAttribute == null)
            {
                context.Result = new ForbidResult();
                return Task.CompletedTask;
            }

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                context.Result = new UnauthorizedResult();
                return Task.CompletedTask;
            }

            var isSuperAdmin = user.IsInRole(AppRoles.SuperAdmin);
            if (_permissions.Length == 0
                || !_permissions.Any(p => _permissionService.HasPermission(userId, isSuperAdmin, featureAttribute.Feature, p)))
            {
                context.Result = new ForbidResult();
            }

            return Task.CompletedTask;
        }
    }
}
