using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;
using System;
using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory
{
    public class NewsCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public List<NewsEmojiDto> Emojis { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
