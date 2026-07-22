using FluentValidation;
using Linkdev.MOS.SuperApp.Business.Dtos.Authentication;

namespace Linkdev.MOS.SuperApp.Business.Validators.Authentication
{
    public class LoginRequestDtoValidator : AbstractValidator<LoginRequestDto>
    {
        public LoginRequestDtoValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required.")
                .EmailAddress()
                .WithMessage("Email format is invalid.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Password is required.");
        }
    }
}
