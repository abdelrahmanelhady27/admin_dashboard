using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;

namespace LinkDev.MOS.SuperApp.Business.Validators.ServiceIntroPage
{
    public class ServiceFaqDtoValidator : AbstractValidator<ServiceFaqDto>
    {
        public ServiceFaqDtoValidator()
        {
            RuleFor(x => x.Question)
                .MaximumLength(150);

            RuleFor(x => x.Answer)
                .MaximumLength(150);

            RuleFor(x => x)
                .Must(faq =>
                {
                    var hasQuestion = !string.IsNullOrWhiteSpace(faq.Question);
                    var hasAnswer = !string.IsNullOrWhiteSpace(faq.Answer);
                    return hasQuestion == hasAnswer;
                })
                .WithMessage("Please enter the question and answer");
        }
    }
}
