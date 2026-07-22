using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;

namespace Linkdev.MOS.SuperApp.Business.Mapping
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<UserAccountDto, UserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.IsActive ? "Active" : "Suspended"))
                .ForMember(dest => dest.Permissions, opt => opt.Ignore());
        }
    }
}
