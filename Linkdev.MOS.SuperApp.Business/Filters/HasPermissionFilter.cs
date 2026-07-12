using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Filters;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Filters
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

            if (!_permissionService.HasPermission(user, featureAttribute.Feature, _permission))
            {
                context.Result = new ForbidResult();
            }
            return Task.CompletedTask;
        }
    }
}
