using FluentValidation;
using LinkDev.MOS.SuperApp.Business.Dtos.Authentication;

namespace LinkDev.MOS.SuperApp.Business.Validators.Authentication
{
    public class RefreshTokenRequestDtoValidator : AbstractValidator<RefreshTokenRequestDto>
    {
        public RefreshTokenRequestDtoValidator()
        {
            RuleFor(x => x.RefreshToken)
                .NotEmpty()
                .WithMessage("Refresh token is required.");
        }
    }
}
