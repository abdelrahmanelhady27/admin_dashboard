namespace Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage
{
    public class LinkedServiceDto
    {
        public int Id { get; set; }
        public int SystemId { get; set; }
        public string NameAr { get; set; } = "";
        public string NameEn { get; set; } = "";
        public string DeepLink { get; set; } = "";
        public bool IsActive { get; set; }
        public string? SystemNameAr { get; set; }
        public string? SystemNameEn { get; set; }
    }
}
