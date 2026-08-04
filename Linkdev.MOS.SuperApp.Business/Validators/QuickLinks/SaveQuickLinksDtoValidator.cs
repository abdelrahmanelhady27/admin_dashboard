using FluentValidation;
using LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks;
using System.Linq;

namespace LinkDev.MOS.SuperApp.Business.Validators.QuickLinks
{
    public class SaveQuickLinksDtoValidator : AbstractValidator<SaveQuickLinksDto>
    {
        public SaveQuickLinksDtoValidator()
        {
            RuleFor(x => x.Links)
                .NotNull();

            RuleForEach(x => x.Links)
                .ChildRules(link =>
                {
                    link.RuleFor(i => i.ServiceId)
                        .GreaterThan(0)
                        .WithMessage("A service must be selected.");
                });

            RuleFor(x => x.Links)
                .Must(links => links == null || links.Select(l => l.ServiceId).Distinct().Count() == links.Count)
                .WithMessage("The same service cannot be added more than once.");
        }
    }
}
