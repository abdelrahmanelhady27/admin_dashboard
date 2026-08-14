using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq;

namespace LinkDev.MOS.SuperApp.Business.Validators.ServiceIntroPage.ServiceFaq
{
    public class UpdateServiceFaqDtoValidator : AbstractValidator<UpdateServiceFaqDto>
    {
        public UpdateServiceFaqDtoValidator()
        {
            RuleFor(x => x.Question).NotEmpty().MaximumLength(150);
            RuleFor(x => x.Answer).NotEmpty().MaximumLength(150);
            RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(1);
        }
    }
}
