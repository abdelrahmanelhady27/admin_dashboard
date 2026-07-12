using LinkDev.MOS.SuperApp.Utility.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.DataAccess.Entites.Common
{
    public abstract class BaseEntity : IAuditableEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
        public bool IsDeleted { get; set; }
    }
}
