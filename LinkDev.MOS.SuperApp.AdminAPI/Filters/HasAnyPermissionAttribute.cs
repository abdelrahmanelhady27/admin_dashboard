using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class HasAnyPermissionAttribute : TypeFilterAttribute
    {
        public HasAnyPermissionAttribute(params PermissionAction[] permissions)
            : base(typeof(HasAnyPermissionFilter))
        {
            Arguments = [permissions];
        }
    }
}
