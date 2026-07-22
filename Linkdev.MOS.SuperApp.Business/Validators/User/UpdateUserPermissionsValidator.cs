using System.Collections.Generic;
using FluentValidation;
using Linkdev.MOS.SuperApp.Business.DTOs.User;

namespace Linkdev.MOS.SuperApp.Business.Validators.User
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
