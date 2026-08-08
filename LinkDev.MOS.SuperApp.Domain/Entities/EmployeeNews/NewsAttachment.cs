using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews
{
    public class NewsAttachment : BaseEntity
    {
        public int EmployeeNewsItemId { get; set; }
        public string Name { get; set; } = "";
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }

        public EmployeeNewsItem? EmployeeNewsItem { get; set; }
    }
}
