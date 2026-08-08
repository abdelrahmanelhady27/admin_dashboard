using FluentValidation;
using LinkDev.MOS.SuperApp.Business.Interfaces.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.Interfaces.Permissions;
using LinkDev.MOS.SuperApp.Business.Interfaces.QuickLinks;
using LinkDev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Business.Interfaces.Users;
using LinkDev.MOS.SuperApp.Business.Services.AuditLogs;
using LinkDev.MOS.SuperApp.Business.Services.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.Services.Permissions;
using LinkDev.MOS.SuperApp.Business.Services.QuickLinks;
using LinkDev.MOS.SuperApp.Business.Services.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Business.Services.Users;
using LinkDev.MOS.SuperApp.Business.Validators.ServiceIntroPage;
using Microsoft.Extensions.DependencyInjection;

namespace LinkDev.MOS.SuperApp.Business
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddBusinessServices(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<CreateServiceIntroPageDtoValidator>();

            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IServiceIntroPageService, ServiceIntroPageService>();
            services.AddScoped<IQuickLinkService, QuickLinkService>();
            services.AddScoped<IAuditLogService, AuditLogService>();
            services.AddScoped<IEmployeeNewsService, EmployeeNewsService>();
            services.AddScoped<INewsCategoryService, NewsCategoryService>();
            services.AddScoped<INewsEmojiService, NewsEmojiService>();

            return services;
        }
    }
}
