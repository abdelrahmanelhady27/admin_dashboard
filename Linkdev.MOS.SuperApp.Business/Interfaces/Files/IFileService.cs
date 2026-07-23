using Linkdev.MOS.SuperApp.Business.DTOs.Files;
using Linkdev.MOS.SuperApp.Business.Enums;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Files
{
    public interface IFileService
    {
        Task<UploadedFileDto> UploadAsync(IFormFile file, FileCategory category);
    }
}
