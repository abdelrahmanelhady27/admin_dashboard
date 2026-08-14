using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;

namespace LinkDev.MOS.SuperApp.Business.Validators.ServiceIntroPage
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
                .Must(docs => docs == null || docs.Count <= 5)
                .WithMessage("A maximum of 5 service documents is allowed.");

            RuleForEach(x => x.Documents)
                .SetValidator(new ServiceDocumentDtoValidator())
                .When(x => x.Documents != null);

            RuleFor(x => x.FaqIds)
                .Must(ids => ids == null || ids.Count <= 10)
                .WithMessage("A maximum of 10 FAQs is allowed.");
        }
    }
}
