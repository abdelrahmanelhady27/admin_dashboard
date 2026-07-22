using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.DataAccess.Entites.Common;
using System;
using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.DataAccess.Entites.ServiceIntroPages
{
    public class ServiceIntroPage : BaseEntity
    {
        public int ServiceId { get; set; }
        public PageStatus Status { get; set; }
        public string Description { get; set; } = "";
        public string ProcessingDuration { get; set; } = "";
        public string? VideoUrl { get; set; }
        public string? VideoFileName { get; set; }
        public string? PublishedSnapshotJson { get; set; }
        public DateTime? PublishedAt { get; set; }

        public LinkedService? Service { get; set; }
        public ICollection<ServiceDocument> Documents { get; set; } = new List<ServiceDocument>();
        public ICollection<ServiceFaq> Faqs { get; set; } = new List<ServiceFaq>();
    }
}
