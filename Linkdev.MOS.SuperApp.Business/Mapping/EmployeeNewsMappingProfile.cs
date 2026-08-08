using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsCategory;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;
using LinkDev.MOS.SuperApp.Domain.Entities.EmployeeNews;

namespace LinkDev.MOS.SuperApp.Business.Mapping
{
    public class EmployeeNewsMappingProfile : Profile
    {
        public EmployeeNewsMappingProfile()
        {
            CreateMap<EmployeeNewsItem, EmployeeNewsDto>()
                .ForMember(d => d.CategoryName, opt => opt.Ignore())
                .ForMember(d => d.Status, opt => opt.MapFrom(s => s.Status.ToString()))
                .ForMember(d => d.Attachments, opt => opt.Ignore());

            CreateMap<NewsAttachment, NewsAttachmentDto>().ReverseMap()
                .ForMember(d => d.EmployeeNewsItemId, opt => opt.Ignore())
                .ForMember(d => d.EmployeeNewsItem, opt => opt.Ignore());

            CreateMap<NewsEmoji, NewsEmojiDto>();
            CreateMap<NewsCategory, NewsCategoryDto>()
                .ForMember(d => d.Emojis, opt => opt.Ignore());
        }
    }
}
