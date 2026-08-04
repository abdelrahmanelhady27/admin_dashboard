namespace LinkDev.MOS.SuperApp.Business.DTOs.Files
{
    public class UploadedFileDto
    {
        public string Url { get; set; } = "";
        public string FileName { get; set; } = "";
        public string FileType { get; set; } = "";
        public long SizeBytes { get; set; }
    }
}
