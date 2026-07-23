using Linkdev.MOS.SuperApp.Business.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Linkdev.MOS.SuperApp.Business.Filters
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class HasAnyPermissionAttribute : TypeFilterAttribute
    {
        public HasAnyPermissionAttribute(params PermissionAction[] permissions)
            : base(typeof(HasAnyPermissionFilter))
        {
            Arguments = new object[] { permissions };
        }
    }
}
