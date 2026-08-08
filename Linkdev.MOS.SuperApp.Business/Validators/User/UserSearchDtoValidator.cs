using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using LinkDev.MOS.SuperApp.Business.Validators.Common;

namespace LinkDev.MOS.SuperApp.Business.Validators.User
{
    public class UserSearchDtoValidator : AbstractValidator<UserSearchDto>
    {
        public UserSearchDtoValidator()
        {
            PagedRequestRules.Apply(this);
        }
    }
}
