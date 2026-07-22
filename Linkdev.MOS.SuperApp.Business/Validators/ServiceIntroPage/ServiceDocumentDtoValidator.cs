using FluentValidation;
using Linkdev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;

namespace Linkdev.MOS.SuperApp.Business.Validators.ServiceIntroPage
{
    public class ServiceDocumentDtoValidator : AbstractValidator<ServiceDocumentDto>
    {
        public ServiceDocumentDtoValidator()
        {
            RuleFor(x => x.Name)
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
