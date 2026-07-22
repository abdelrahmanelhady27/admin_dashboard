using FluentValidation;
using Linkdev.MOS.SuperApp.Business.Validators.ServiceIntroPage;
using Microsoft.Extensions.DependencyInjection;

namespace Linkdev.MOS.SuperApp.Business
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddBusinessServices(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<CreateServiceIntroPageDtoValidator>();
            return services;
        }
    }
}
