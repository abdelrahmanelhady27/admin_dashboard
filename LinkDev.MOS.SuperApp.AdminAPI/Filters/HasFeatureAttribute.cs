using LinkDev.MOS.SuperApp.Domain.Enums;

namespace LinkDev.MOS.SuperApp.AdminAPI.Filters
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
    public class HasFeatureAttribute : Attribute
    {
        public FeatureType[] Features { get; }

        public HasFeatureAttribute(params FeatureType[] features)
        {
            Features = features ?? [];
        }
    }
}
