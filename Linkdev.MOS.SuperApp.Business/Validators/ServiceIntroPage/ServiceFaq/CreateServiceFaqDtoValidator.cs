using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq;

namespace LinkDev.MOS.SuperApp.Business.Validators.ServiceIntroPage.ServiceFaq
{
    public class CreateServiceFaqDtoValidator : AbstractValidator<CreateServiceFaqDto>
    {
        public CreateServiceFaqDtoValidator()
        {
            RuleFor(x => x.Question).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Answer).NotEmpty().MaximumLength(150);
            RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(1);
        }
    }
}
