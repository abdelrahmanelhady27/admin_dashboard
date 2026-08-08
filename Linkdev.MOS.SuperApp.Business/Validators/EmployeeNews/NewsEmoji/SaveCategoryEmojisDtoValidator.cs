using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;

namespace LinkDev.MOS.SuperApp.Business.Validators.EmployeeNews.NewsEmoji
{
    public class SaveCategoryEmojisDtoValidator : AbstractValidator<SaveCategoryEmojisDto>
    {
        public SaveCategoryEmojisDtoValidator()
        {
            RuleForEach(x => x.EmojiIds).GreaterThan(0);
        }
    }
}
