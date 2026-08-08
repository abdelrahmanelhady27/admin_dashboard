using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using LinkDev.MOS.SuperApp.Business.Validators.Common;

namespace LinkDev.MOS.SuperApp.Business.Validators.ServiceIntroPage
{
    public class ServiceIntroPageSearchDtoValidator : AbstractValidator<ServiceIntroPageSearchDto>
    {
        public ServiceIntroPageSearchDtoValidator()
        {
            PagedRequestRules.Apply(this);
        }
    }
}
