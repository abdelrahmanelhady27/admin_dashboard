using LinkDev.MOS.SuperApp.Domain.Common;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews
{
    public class EmployeeNewsItem : BaseEntity
    {
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public int? CategoryId { get; set; }
        public PageStatus Status { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageFileName { get; set; }
        public DateTime? PublishedAt { get; set; }

        public NewsCategory? Category { get; set; }
        public ICollection<NewsAttachment> Attachments { get; set; } = new List<NewsAttachment>();
    }
}
