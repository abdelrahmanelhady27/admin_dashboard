using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews
{
    public class UpdateEmployeeNewsDto
    {
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public int? CategoryId { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageFileName { get; set; }
        public List<NewsAttachmentDto> Attachments { get; set; } = new();
        public bool SaveAsDraft { get; set; }
    }
}
