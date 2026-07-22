using FluentValidation;
using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;

namespace Linkdev.MOS.SuperApp.Business.Validators.ServiceIntroPage
{
    public class UpdateServiceIntroPageDtoValidator : AbstractValidator<UpdateServiceIntroPageDto>
    {
        public UpdateServiceIntroPageDtoValidator()
        {
            RuleFor(x => x.Description)
                .MaximumLength(190);

            RuleFor(x => x.ProcessingDuration)
                .MaximumLength(20);

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
