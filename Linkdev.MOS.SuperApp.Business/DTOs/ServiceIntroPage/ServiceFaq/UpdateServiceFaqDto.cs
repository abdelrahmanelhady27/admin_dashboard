namespace LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq
{
    public class UpdateServiceFaqDto
    {
        public string Question { get; set; } = "";
        public string Answer { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
