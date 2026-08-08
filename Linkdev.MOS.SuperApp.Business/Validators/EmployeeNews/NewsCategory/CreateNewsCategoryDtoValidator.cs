using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory;

namespace LinkDev.MOS.SuperApp.Business.Validators.EmployeeNews.NewsCategory
{
    public class CreateNewsCategoryDtoValidator : AbstractValidator<CreateNewsCategoryDto>
    {
        public CreateNewsCategoryDtoValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            RuleFor(x => x.DisplayOrder).GreaterThanOrEqualTo(1);
        }
    }
}
