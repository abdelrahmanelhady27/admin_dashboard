using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory
{
    public class UpdateNewsCategoryDto
    {
        public string Name { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
        public List<int> EmojiIds { get; set; } = new();
    }
}
