using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews
{
    public class NewsEmoji : BaseEntity
    {
        public string Name { get; set; } = "";
        public string Code { get; set; } = "";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<NewsCategoryEmoji> CategoryEmojis { get; set; } = new List<NewsCategoryEmoji>();
    }
}
