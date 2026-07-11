using Linkdev.MOS.SuperApp.Business.Entites.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Entites
{
    public class StaticUser : BaseEntity
    {
        public string FullName { get; set; }
        public string Email { get; set; }
    }
}
