using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Identity.Entites;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Mapping
{
    public class IdentityMappingProfile : Profile
    {
        public IdentityMappingProfile()
        {

            // Application User
            CreateMap<ApplicationUser, UserAccountDto>()
                .ForMember(dest => dest.StaticUserId, opt => opt.MapFrom(src => src.StaticUserId));
        }
    }
}
