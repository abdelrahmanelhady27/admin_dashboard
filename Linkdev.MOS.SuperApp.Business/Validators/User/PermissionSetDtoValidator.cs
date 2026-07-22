using FluentValidation;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Business.Enums;

namespace Linkdev.MOS.SuperApp.Business.Validators.User
{
    public class PermissionSetDtoValidator : AbstractValidator<PermissionSetDto>
    {
        public PermissionSetDtoValidator()
        {
            RuleFor(x => x.Feature)
                .IsInEnum()
                .WithMessage("Invalid content type.");

            RuleFor(x => x)
                .Must(p =>
                {
                    var hasAdvanced = p.CanCreate || p.CanEdit || p.CanDelete || p.CanPublish;
                    return !hasAdvanced || p.CanView;
                })
                .WithMessage("Advanced permissions cannot be granted without a view permission on the same content.");
        }
    }
}
