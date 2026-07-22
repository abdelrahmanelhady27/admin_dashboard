using FluentValidation;
using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;

namespace Linkdev.MOS.SuperApp.Business.Validators.ServiceIntroPage
{
    public class CreateServiceIntroPageDtoValidator : AbstractValidator<CreateServiceIntroPageDto>
    {
        public CreateServiceIntroPageDtoValidator()
        {
            RuleFor(x => x.ServiceId)
                .GreaterThan(0)
                .WithMessage("A service must be selected.");

            RuleFor(x => x.Description)
                .MaximumLength(190);

            RuleFor(x => x.ProcessingDuration)
                .MaximumLength(20);

            RuleFor(x => x.Description)
                .NotEmpty()
                .When(x => x.Publish)
                .WithMessage("Please complete all mandatory fields before publishing");

            RuleFor(x => x.ProcessingDuration)
                .NotEmpty()
                .When(x => x.Publish)
                .WithMessage("Please complete all mandatory fields before publishing");

            RuleFor(x => x.Documents)
                .Must(docs => docs == null || docs.Count <= 3)
                .WithMessage("A maximum of 3 service documents is allowed.");

            RuleForEach(x => x.Documents)
                .SetValidator(new ServiceDocumentDtoValidator())
                .When(x => x.Documents != null);

            RuleFor(x => x.Faqs)
                .Must(faqs => faqs == null || faqs.Count <= 10)
                .WithMessage("A maximum of 10 FAQs is allowed.");

            RuleForEach(x => x.Faqs)
                .SetValidator(new ServiceFaqDtoValidator())
                .When(x => x.Faqs != null);
        }
    }
}
