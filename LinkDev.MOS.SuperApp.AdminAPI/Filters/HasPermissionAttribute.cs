using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class HasPermissionAttribute : TypeFilterAttribute
    {
        public HasPermissionAttribute(params PermissionAction[] permissions)
            : base(typeof(PermissionAuthorizationFilter))
        {
            Arguments = [permissions];
        }
    }
}
