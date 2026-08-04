using LinkDev.MOS.SuperApp.Business.DTOs.Files;
using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Files
{
    public interface IFileService
    {
        Task<UploadedFileDto> UploadAsync(FileUploadRequest file, FileCategory category);
    }
}
