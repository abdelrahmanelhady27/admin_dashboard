using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks;
using LinkDev.MOS.SuperApp.Domain.Entities.QuickLinks;

namespace LinkDev.MOS.SuperApp.Business.Mapping
{
    public class QuickLinkMappingProfile : Profile
    {
        public QuickLinkMappingProfile()
        {
            CreateMap<QuickLink, QuickLinkDto>()
                .ForMember(dest => dest.SystemId, opt => opt.MapFrom(src => src.Service != null ? src.Service.SystemId : 0))
                .ForMember(dest => dest.ServiceNameAr, opt => opt.MapFrom(src => src.Service != null ? src.Service.NameAr : ""))
                .ForMember(dest => dest.ServiceNameEn, opt => opt.MapFrom(src => src.Service != null ? src.Service.NameEn : ""))
                .ForMember(dest => dest.SystemNameAr, opt => opt.MapFrom(src => src.Service != null && src.Service.System != null ? src.Service.System.NameAr : ""))
                .ForMember(dest => dest.SystemNameEn, opt => opt.MapFrom(src => src.Service != null && src.Service.System != null ? src.Service.System.NameEn : ""))
                .ForMember(dest => dest.DeepLink, opt => opt.MapFrom(src => src.Service != null ? src.Service.DeepLink : ""));
        }
    }
}
