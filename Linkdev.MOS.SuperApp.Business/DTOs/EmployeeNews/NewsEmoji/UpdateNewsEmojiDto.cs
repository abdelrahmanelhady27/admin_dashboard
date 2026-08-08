using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji
{
    public class UpdateNewsEmojiDto
    {
        public string Name { get; set; } = "";
        public string Code { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
