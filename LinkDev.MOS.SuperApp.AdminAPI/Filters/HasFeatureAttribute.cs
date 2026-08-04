using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
    public class HasFeatureAttribute : Attribute
    {
        public FeatureType Feature { get; }

        public HasFeatureAttribute(FeatureType feature)
        {
            Feature = feature;
        }
    }
}
