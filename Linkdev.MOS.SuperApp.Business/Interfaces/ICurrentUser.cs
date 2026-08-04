namespace LinkDev.MOS.SuperApp.Business.Interfaces
{
    public interface ICurrentUser
    {
        bool IsAuthenticated { get; }
        int? UserId { get; }
        bool IsInRole(string role);
        string DisplayName { get; }
    }
}
