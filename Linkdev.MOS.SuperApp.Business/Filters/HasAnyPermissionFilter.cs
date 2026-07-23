using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Interfaces.Permissions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Filters
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

            if (_permissions.Length == 0
                || !_permissions.Any(p => _permissionService.HasPermission(user, featureAttribute.Feature, p)))
            {
                context.Result = new ForbidResult();
            }

            return Task.CompletedTask;
        }
    }
}
