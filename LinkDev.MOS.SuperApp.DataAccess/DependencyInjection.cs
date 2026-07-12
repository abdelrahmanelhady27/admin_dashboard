using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.DataAccess.Interfaces.Repositories;
using Linkdev.MOS.SuperApp.Business.Interfaces.Services;
using Linkdev.MOS.SuperApp.Business.Mapping;
using Linkdev.MOS.SuperApp.Business.Services;
using LinkDev.MOS.SuperApp.DataAccess.DbContexts;
using LinkDev.MOS.SuperApp.DataAccess.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LinkDev.MOS.SuperApp.DataAccess.Mapping;

namespace LinkDev.MOS.SuperApp.DataAccess
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDataAccessServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAutoMapper(cfg => {}, new System.Reflection.Assembly[] {
                                    typeof(MappingProfile).Assembly, 
                                    typeof(EntityMappingProfile).Assembly,
                                    typeof(IdentityMappingProfile).Assembly
            });

            services.AddDbContext<AdminDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("AdminDb")));

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            services.AddScoped(typeof(IQueryableRepository<>), typeof(QueryableRepository<>));
            services.AddScoped<IUserPermissionRepository, UserPermissionRepository>();
            services.AddScoped<IPermissionService, PermissionService>();
            services.AddScoped<IUserService, UserService>();


            return services;
        }
    }
}
