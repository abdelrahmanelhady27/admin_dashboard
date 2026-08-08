using LinkDev.MOS.SuperApp.Domain.Common;

namespace LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews
{
    public class NewsCategoryEmoji : BaseEntity
    {
        public int CategoryId { get; set; }
        public int EmojiId { get; set; }

        public NewsCategory? Category { get; set; }
        public NewsEmoji? Emoji { get; set; }
    }
}
