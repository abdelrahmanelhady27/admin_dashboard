using Linkdev.MOS.SuperApp.Business.Enums;

namespace Linkdev.MOS.SuperApp.Business.DTOs.User
{
    public class PermissionSetDto
    {
        public FeatureType Feature { get; set; }
        public bool CanView { get; set; }
        public bool CanCreate { get; set; }
        public bool CanEdit { get; set; }
        public bool CanDelete { get; set; }
        public bool CanPublish { get; set; }
    }
}
