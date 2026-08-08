using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;

namespace LinkDev.MOS.SuperApp.Business.Validators.EmployeeNews.NewsEmoji
{
    public class UpdateNewsEmojiDtoValidator : AbstractValidator<UpdateNewsEmojiDto>
    {
        public UpdateNewsEmojiDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Code).NotEmpty().MaximumLength(32);
            RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(1);
        }
    }
}
