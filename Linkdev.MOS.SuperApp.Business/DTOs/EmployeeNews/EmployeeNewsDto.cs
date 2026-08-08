using System;
using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews
{
    public class EmployeeNewsDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Content { get; set; } = "";
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string Status { get; set; } = "";
        public string? ImageUrl { get; set; }
        public string? ImageFileName { get; set; }
        public List<NewsAttachmentDto> Attachments { get; set; } = new();
        public DateTime? PublishedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
