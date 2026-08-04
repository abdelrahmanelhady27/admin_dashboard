using AutoMapper;
using LinkDev.MOS.SuperApp.Business.DTOs.UserPermission;
using LinkDev.MOS.SuperApp.Domain.Entities.Permission;

namespace LinkDev.MOS.SuperApp.Business.Mapping
{
    public class PermissionMappingProfile : Profile
    {
        public PermissionMappingProfile()
        {
            CreateMap<UserPermission, UserPermissionDto>().ReverseMap();
        }
    }
}
