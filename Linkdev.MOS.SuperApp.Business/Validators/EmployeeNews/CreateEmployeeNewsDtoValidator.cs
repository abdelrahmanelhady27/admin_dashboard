using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews;

namespace LinkDev.MOS.SuperApp.Business.Validators.EmployeeNews
{
    public class CreateEmployeeNewsDtoValidator : AbstractValidator<CreateEmployeeNewsDto>
    {
        public CreateEmployeeNewsDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty()
                .MaximumLength(200);

            RuleFor(x => x.Content)
                .MaximumLength(4000);

            RuleFor(x => x.Content)
                .NotEmpty()
                .When(x => x.Publish);

            RuleFor(x => x.CategoryId)
                .NotNull()
                .GreaterThan(0)
                .When(x => x.Publish);

            RuleFor(x => x.ImageUrl)
                .MaximumLength(1000)
                .When(x => x.ImageUrl != null);

            RuleFor(x => x.ImageFileName)
                .MaximumLength(255)
                .When(x => x.ImageFileName != null);

            RuleFor(x => x.Attachments)
                .Must(a => a == null || a.Count <= 5)
                .WithMessage("A maximum of 5 attachments is allowed");

            RuleForEach(x => x.Attachments)
                .SetValidator(new NewsAttachmentDtoValidator());
        }
    }
}
