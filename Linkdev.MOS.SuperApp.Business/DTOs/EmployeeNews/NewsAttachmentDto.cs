namespace LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews
{
    public class NewsAttachmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string? FileUrl { get; set; }
        public string? FileName { get; set; }
        public string? FileType { get; set; }
    }
}
