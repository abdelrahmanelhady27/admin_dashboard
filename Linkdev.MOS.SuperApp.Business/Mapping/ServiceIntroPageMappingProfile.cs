using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using LinkDev.MOS.SuperApp.Domain.Entities.ServiceIntroPages;

namespace LinkDev.MOS.SuperApp.Business.Mapping
{
    public class ServiceIntroPageMappingProfile : Profile
    {
        public ServiceIntroPageMappingProfile()
        {
            CreateMap<ServiceIntroPage, ServiceIntroPageDto>()
                .ForMember(dest => dest.ServiceNameAr, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceNameEn, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Documents, opt => opt.Ignore())
                .ForMember(dest => dest.Faqs, opt => opt.Ignore());

            CreateMap<ServiceDocument, ServiceDocumentDto>().ReverseMap()
                .ForMember(dest => dest.ServiceIntroPageId, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceIntroPage, opt => opt.Ignore());

            CreateMap<ServiceFaq, ServiceFaqDto>().ReverseMap()
                .ForMember(dest => dest.ServiceIntroPageId, opt => opt.Ignore())
                .ForMember(dest => dest.ServiceIntroPage, opt => opt.Ignore());

            CreateMap<LinkedService, LinkedServiceDto>()
                .ForMember(dest => dest.SystemNameAr, opt => opt.MapFrom(src => src.System != null ? src.System.NameAr : null))
                .ForMember(dest => dest.SystemNameEn, opt => opt.MapFrom(src => src.System != null ? src.System.NameEn : null));

            CreateMap<AvailableLinkedService, LinkedServiceDto>();
        }
    }
}
