using Linkdev.MOS.SuperApp.Business.Enums;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Filters
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
    public class HasPermissionAttribute : TypeFilterAttribute
    {
        public HasPermissionAttribute(PermissionAction permission) : base(typeof(HasPermissionFilter))
        {
            Arguments = new object[] { permission };
        }

        
    
    }
}
