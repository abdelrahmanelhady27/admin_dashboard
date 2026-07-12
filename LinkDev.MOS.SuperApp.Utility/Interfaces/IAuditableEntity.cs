using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Utility.Interfaces
{
    public interface IAuditableEntity
    {
        DateTime CreatedAt { get; set; }
        string? CreatedBy { get; set; }
        DateTime? ModifiedAt { get; set; }
        string? ModifiedBy { get; set; }
        bool IsDeleted { get; set; }
    }
}
