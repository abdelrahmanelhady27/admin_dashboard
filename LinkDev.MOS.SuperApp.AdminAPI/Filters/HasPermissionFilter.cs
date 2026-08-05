using LinkDev.MOS.SuperApp.Business.Interfaces.Permissions;
using LinkDev.MOS.SuperApp.Domain.Constants;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    public class HasPermissionFilter : IAsyncAuthorizationFilter
    {
        private readonly PermissionAction _permission;
        private readonly IPermissionService _permissionService;

        public HasPermissionFilter(PermissionAction permission, IPermissionService permissionService)
        {
            _permission = permission;
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
            if (!_permissionService.HasPermission(userId, isSuperAdmin, featureAttribute.Feature, _permission))
            {
                context.Result = new ForbidResult();
            }

            return Task.CompletedTask;
        }
    }
}
