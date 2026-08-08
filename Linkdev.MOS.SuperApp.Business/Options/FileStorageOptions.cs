namespace LinkDev.MOS.SuperApp.Business.Options
{
    public class FileStorageOptions
    {
        public const string SectionName = "FileStorage";

        public const string FileSizeExceededMessage = "The file size exceeds the allowed limit";

        public string RootPath { get; set; } = "uploads";

        public long MaxVideoSizeBytes { get; set; } = 100L * 1024 * 1024;

        public long MaxDocumentSizeBytes { get; set; } = 10L * 1024 * 1024;

        public long MaxImageSizeBytes { get; set; } = 3L * 1024 * 1024;

        public string[] VideoExtensions { get; set; } = [".mp4"];

        public string[] VideoMimeTypes { get; set; } = ["video/mp4"];

        public string[] DocumentExtensions { get; set; } = [".pdf"];

        public string[] DocumentMimeTypes { get; set; } = ["application/pdf"];

        public string[] ImageExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".webp"];

        public string[] ImageMimeTypes { get; set; } = ["image/jpeg", "image/png", "image/webp"];
    }
}
