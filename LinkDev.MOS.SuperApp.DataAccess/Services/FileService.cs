using LinkDev.MOS.SuperApp.Business.DTOs.Files;
using LinkDev.MOS.SuperApp.Business.Interfaces.Files;
using LinkDev.MOS.SuperApp.Business.Options;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;

namespace LinkDev.MOS.SuperApp.DataAccess.Services
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly FileStorageOptions _options;

        public FileService(IWebHostEnvironment environment, IOptions<FileStorageOptions> options)
        {
            _environment = environment;
            _options = options.Value;
        }

        public async Task<UploadedFileDto> UploadAsync(FileUploadRequest file, FileCategory category)
        {
            if (file == null || file.Content == null || file.Length == 0)
            {
                throw new InvalidOperationException("No file was provided.");
            }

            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant() ?? string.Empty;
            var contentType = (file.ContentType ?? string.Empty).ToLowerInvariant();

            ValidateCategory(category, extension, contentType, file.Length);

            var subFolder = category == FileCategory.Video ? "videos" : "documents";
            var webRoot = string.IsNullOrWhiteSpace(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;

            var uploadDir = Path.Combine(webRoot, _options.RootPath, subFolder);
            Directory.CreateDirectory(uploadDir);

            var storedFileName = $"{Guid.NewGuid():N}{extension}";
            var physicalPath = Path.Combine(uploadDir, storedFileName);

            await using (var stream = new FileStream(physicalPath, FileMode.Create))
            {
                await file.Content.CopyToAsync(stream);
            }

            var relativeUrl = $"/{_options.RootPath.Trim('/')}/{subFolder}/{storedFileName}";

            return new UploadedFileDto
            {
                Url = relativeUrl,
                FileName = file.FileName,
                FileType = string.IsNullOrWhiteSpace(file.ContentType) ? contentType : file.ContentType,
                SizeBytes = file.Length
            };
        }

        private void ValidateCategory(FileCategory category, string extension, string contentType, long size)
        {
            switch (category)
            {
                case FileCategory.Video:
                    if (!_options.VideoExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase)
                        || !_options.VideoMimeTypes.Any(m => string.Equals(m, contentType, StringComparison.OrdinalIgnoreCase)))
                    {
                        throw new InvalidOperationException("The video format is not supported");
                    }

                    if (size > _options.MaxVideoSizeBytes)
                    {
                        throw new InvalidOperationException(FileStorageOptions.FileSizeExceededMessage);
                    }
                    break;

                case FileCategory.Document:
                    if (!_options.DocumentExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase)
                        || !_options.DocumentMimeTypes.Any(m => string.Equals(m, contentType, StringComparison.OrdinalIgnoreCase)))
                    {
                        throw new InvalidOperationException("The file type is not supported");
                    }

                    if (size > _options.MaxDocumentSizeBytes)
                    {
                        throw new InvalidOperationException(FileStorageOptions.FileSizeExceededMessage);
                    }
                    break;

                default:
                    throw new InvalidOperationException("The file type is not supported");
            }
        }
    }
}
