using LinkDev.MOS.SuperApp.Business.Interfaces;
using LinkDev.MOS.SuperApp.Business.Interfaces.Files;
using LinkDev.MOS.SuperApp.Business.Mapping;
using LinkDev.MOS.SuperApp.Business.Options;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories;
using LinkDev.MOS.SuperApp.Business.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.DataAccess.Common;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.DataAccess.Services;
using LinkDev.MOS.SuperApp.Identity.Mapping;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LinkDev.MOS.SuperApp.DataAccess
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDataAccessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAutoMapper(cfg => { },
                typeof(UserMappingProfile).Assembly,
                typeof(IdentityMappingProfile).Assembly);

            services.AddDbContext<AdminDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("AdminDb")));

            services.Configure<FileStorageOptions>(configuration.GetSection(FileStorageOptions.SectionName));

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();
            services.AddScoped<IServiceIntroPageRepository, ServiceIntroPageRepository>();
            services.AddScoped<IQuickLinkRepository, QuickLinkRepository>();
            services.AddScoped<IAuditLogRepository, AuditLogRepository>();
            services.AddScoped<IStaticUserRepository, StaticUserRepository>();
            services.AddScoped<IFileService, FileService>();

            return services;
        }
    }
}
