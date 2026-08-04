using System.Collections.Generic;

namespace LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks
{
    public class SaveQuickLinksDto
    {
        public List<QuickLinkItemDto> Links { get; set; } = new();
    }
}
