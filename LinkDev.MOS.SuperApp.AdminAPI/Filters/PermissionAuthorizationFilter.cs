using LinkDev.MOS.SuperApp.Business.Interfaces.Permissions;
using LinkDev.MOS.SuperApp.Domain.Constants;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    public class PermissionAuthorizationFilter : IAsyncAuthorizationFilter
    {
        private readonly PermissionAction[] _permissions;
        private readonly IPermissionService _permissionService;

        public PermissionAuthorizationFilter(PermissionAction[] permissions, IPermissionService permissionService)
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

            var features = ResolveFeatures(context);
            if (features.Length == 0)
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
                || !features.Any(feature =>
                    _permissions.Any(p => _permissionService.HasPermission(userId, isSuperAdmin, feature, p))))
            {
                context.Result = new ForbidResult();
            }

            return Task.CompletedTask;
        }

        private static FeatureType[] ResolveFeatures(AuthorizationFilterContext context)
        {
            var featureAttr = context.ActionDescriptor.EndpointMetadata
                .OfType<HasFeatureAttribute>()
                .FirstOrDefault();
            return featureAttr?.Features is { Length: > 0 } features ? features : [];
        }
    }
}
