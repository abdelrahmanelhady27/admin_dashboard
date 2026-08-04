using System.Collections.Generic;

namespace Linkdev.MOS.SuperApp.Business.DTOs.QuickLinks
{
    public class SaveQuickLinksDto
    {
        public List<QuickLinkItemDto> Links { get; set; } = new();
    }
}
