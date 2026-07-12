using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.DataAccess.Entites
{
    public class StaticUser : BaseEntity
    {
        public string FullName { get; set; }
        public string Email { get; set; }
    }
}
