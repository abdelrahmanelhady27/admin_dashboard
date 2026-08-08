using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews
{
    public class NewsCategory : BaseEntity
    {
        public string Name { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<EmployeeNewsItem> NewsItems { get; set; } = new List<EmployeeNewsItem>();
        public ICollection<NewsCategoryEmoji> CategoryEmojis { get; set; } = new List<NewsCategoryEmoji>();
    }
}
