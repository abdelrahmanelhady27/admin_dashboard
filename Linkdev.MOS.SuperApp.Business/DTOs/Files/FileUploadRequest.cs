namespace LinkDev.MOS.SuperApp.Business.DTOs.Files
{
    public class FileUploadRequest
    {
        public required Stream Content { get; set; }
        public required string FileName { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public long Length { get; set; }
    }
}
