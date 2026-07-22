using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using Linkdev.MOS.SuperApp.Business.Mapping;
using Linkdev.MOS.SuperApp.Business.Services;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LinkDev.MOS.SuperApp.DataAccess.Mapping;
using LinkDev.MOS.SuperApp.DataAccess.Interfaces.Repositories.Common;
using LinkDev.MOS.SuperApp.DataAccess.Repositories.Common;
using LinkDev.MOS.SuperApp.Identity.Mapping;
using LinkDev.MOS.SuperApp.DataAccess.Entites.Common;
using Linkdev.MOS.SuperApp.Business.Interfaces.Users;
using Linkdev.MOS.SuperApp.Business.Interfaces.Permissions;
using Linkdev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.DataAccess
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDataAccessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAutoMapper(cfg => { },
                typeof(UserMappingProfile).Assembly,
                typeof(EntityMappingProfile).Assembly,
                typeof(IdentityMappingProfile).Assembly);

            services.AddDbContext<AdminDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("AdminDb")));

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IQueryableRepository<>), typeof(QueryableRepository<>));
            services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IServiceIntroPageRepository, ServiceIntroPageRepository>();
            services.AddScoped<IServiceIntroPageService, ServiceIntroPageService>();


            return services;
        }
    }
}
