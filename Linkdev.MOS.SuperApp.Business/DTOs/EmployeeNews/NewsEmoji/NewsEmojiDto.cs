using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji
{
    public class NewsEmojiDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Code { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
