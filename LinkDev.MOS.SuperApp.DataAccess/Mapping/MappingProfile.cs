using AutoMapper;
using Linkdev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Business.DTOs.UserPermission;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.DataAccess.Entites;
using Linkdev.MOS.SuperApp.Identity.Entites;
using LinkDev.MOS.SuperApp.DataAccess.Entites;
using System.Collections.Generic;
using System.Linq;

namespace Linkdev.MOS.SuperApp.Business.Mapping
{
    public class UserMappingModel
    {
        public UserAccountDto Account { get; set; }
        public List<UserPermission> Permissions { get; set; }
    }

    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            

            // UserAccountDto
            CreateMap<UserAccountDto, UserDto>()
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.FullName))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.IsActive ? "Active" : "Suspended"))
                .ForMember(dest => dest.Permissions, opt => opt.Ignore());


            CreateMap<UserMappingModel, UserDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Account.Id))
                .ForMember(dest => dest.StaticUserId, opt => opt.MapFrom(src => src.Account.StaticUserId))
                .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => src.Account.FullName))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Account.IsActive ? "Active" : "Suspended"))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.ModifiedAt, opt => opt.MapFrom(src => src.Account.ModifiedAt))
                .ForMember(dest => dest.ModifiedBy, opt => opt.MapFrom(src => src.Account.ModifiedBy))
                .ForMember(dest => dest.Permissions, opt => opt.MapFrom(src => MapPermissionsList(src.Permissions)));
        }

        private static List<PermissionSetDto> MapPermissionsList(List<UserPermission>? userPermissions)
        {
            var list = new List<PermissionSetDto>();
            var features = new[] { FeatureType.ServiceIntroPage, FeatureType.QuickLinks, FeatureType.EmployeeNews, FeatureType.AuditLog };

            foreach (var feat in features)
            {
                var permsForFeature = userPermissions?.Where(p => p.Feature == feat).ToList() ?? new List<UserPermission>();

                list.Add(new PermissionSetDto
                {
                    Feature = feat,
                    CanView = permsForFeature.Any(p => p.Permission == PermissionAction.Read),
                    CanCreate = permsForFeature.Any(p => p.Permission == PermissionAction.Add),
                    CanEdit = permsForFeature.Any(p => p.Permission == PermissionAction.Edit),
                    CanDelete = permsForFeature.Any(p => p.Permission == PermissionAction.Delete),
                    CanPublish = permsForFeature.Any(p => p.Permission == PermissionAction.Publish)
                });
            }

            return list;
        }
    }
}
