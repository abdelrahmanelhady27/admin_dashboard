using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews;

namespace LinkDev.MOS.SuperApp.Business.Validators.EmployeeNews
{
    public class NewsAttachmentDtoValidator : AbstractValidator<NewsAttachmentDto>
    {
        public NewsAttachmentDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .MaximumLength(30);

            RuleFor(x => x.FileUrl)
                .MaximumLength(1000)
                .When(x => x.FileUrl != null);

            RuleFor(x => x.FileName)
                .MaximumLength(255)
                .When(x => x.FileName != null);

            RuleFor(x => x.FileType)
                .MaximumLength(100)
                .When(x => x.FileType != null);
        }
    }
}
