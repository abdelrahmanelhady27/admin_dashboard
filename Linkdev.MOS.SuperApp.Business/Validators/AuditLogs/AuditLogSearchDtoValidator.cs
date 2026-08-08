using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Validators.Common;

namespace LinkDev.MOS.SuperApp.Business.Validators.AuditLogs
{
    public class AuditLogSearchDtoValidator : AbstractValidator<AuditLogSearchDto>
    {
        public AuditLogSearchDtoValidator()
        {
            PagedRequestRules.Apply(this);

            RuleFor(x => x)
                .Must(x => !x.From.HasValue || !x.To.HasValue || x.From <= x.To)
                .WithMessage("'From' date must be less than or equal to 'To' date.");
        }
    }
}
