using Linkdev.MOS.SuperApp.Business.Enums;

[AttributeUsage(AttributeTargets.Class, AllowMultiple = false)]
public class HasFeatureAttribute : Attribute
{
    public FeatureType Feature { get; }
    public HasFeatureAttribute(FeatureType feature)
    {
        Feature = feature;
    }
}