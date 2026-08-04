using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Identity.Entites;

namespace LinkDev.MOS.SuperApp.Identity.Mapping
{
    public class IdentityMappingProfile : Profile
    {
        public IdentityMappingProfile()
        {
            CreateMap<ApplicationUser, UserAccountDto>()
                .ForMember(dest => dest.StaticUserId, opt => opt.MapFrom(src => src.StaticUserId));
        }
    }
}
