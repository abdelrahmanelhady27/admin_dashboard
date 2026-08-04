using System.Collections.Generic;
using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.User;

namespace LinkDev.MOS.SuperApp.Business.Validators.User
{
    public class UpdateUserPermissionsValidator : AbstractValidator<List<PermissionSetDto>>
    {
        public UpdateUserPermissionsValidator()
        {
            RuleFor(x => x)
                .NotNull()
                .NotEmpty()
                .WithMessage("Please specify at least one piece of content");

            RuleForEach(x => x)
                .SetValidator(new PermissionSetDtoValidator())
                .When(x => x != null);
        }
    }
}
