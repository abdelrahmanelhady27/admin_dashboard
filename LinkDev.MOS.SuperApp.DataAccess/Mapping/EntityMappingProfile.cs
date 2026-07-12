using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Business.DTOs.UserPermission;
using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.Identity.Entites;
using LinkDev.MOS.SuperApp.DataAccess.Entites;
using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.DataAccess.Mapping
{
    public class EntityMappingProfile : Profile
    {
        public EntityMappingProfile() {

            // Static User
            CreateMap<StaticUser, StaticUserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Active"));

            // UserPermission
            CreateMap<UserPermission, UserPermissionDto>().ReverseMap();

            // UnregisteredStaticUser
            CreateMap<UnregisteredStaticUser, StaticUserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => "Active"));

        }
    }
}
