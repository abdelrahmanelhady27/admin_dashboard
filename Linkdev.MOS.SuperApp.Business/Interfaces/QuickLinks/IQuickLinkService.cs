using Linkdev.MOS.SuperApp.Business.DTOs.QuickLinks;
using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.QuickLinks
{
    public interface IQuickLinkService
    {
        Task<IEnumerable<QuickLinkDto>> GetAllAsync();
        Task<IEnumerable<LinkedServiceDto>> GetAvailableServicesAsync();
        Task<IEnumerable<QuickLinkDto>> SaveAsync(SaveQuickLinksDto dto);
    }
}
