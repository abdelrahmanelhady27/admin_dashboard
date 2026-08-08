using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.Common;

namespace LinkDev.MOS.SuperApp.Business.Validators.Common
{
    public static class PagedRequestRules
    {
        public const int MaxPageSize = 100;

        public static void Apply<T>(AbstractValidator<T> validator) where T : PagedRequest
        {
            validator.RuleFor(x => x.PageNumber)
                .GreaterThanOrEqualTo(1)
                .WithMessage("Page number must be at least 1.");

            validator.RuleFor(x => x.PageSize)
                .InclusiveBetween(1, MaxPageSize)
                .WithMessage($"Page size must be between 1 and {MaxPageSize}.");
        }
    }
}
