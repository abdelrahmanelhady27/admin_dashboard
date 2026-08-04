using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Business.DTOs.UserPermission;
using LinkDev.MOS.SuperApp.DataAccess.Entites.Permission;
using LinkDev.MOS.SuperApp.DataAccess.Entites.StaticUsers;

namespace LinkDev.MOS.SuperApp.DataAccess.Mapping
{
    public class EntityMappingProfile : Profile
    {
        public EntityMappingProfile()
        {
            CreateMap<StaticUser, StaticUserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.IsActive ? "Active" : "Inactive"));

            CreateMap<UserPermission, UserPermissionDto>().ReverseMap();

            CreateMap<UnregisteredStaticUser, StaticUserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.IsActive ? "Active" : "Inactive"));
        }
    }
}
