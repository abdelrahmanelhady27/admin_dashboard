using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.User;

namespace LinkDev.MOS.SuperApp.Business.Validators.User
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.StaticUserId)
                .GreaterThan(0)
                .WithMessage("A user must be selected from the search results.");

            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Full name is required.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Email format is invalid.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.Permissions)
                .NotNull()
                .NotEmpty()
                .WithMessage("Please specify at least one piece of content");

            RuleForEach(x => x.Permissions)
                .SetValidator(new PermissionSetDtoValidator())
                .When(x => x.Permissions != null);
        }
    }
}
