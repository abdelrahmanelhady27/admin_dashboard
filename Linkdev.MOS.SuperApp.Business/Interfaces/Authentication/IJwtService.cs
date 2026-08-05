namespace LinkDev.MOS.SuperApp.Business.Interfaces.Authentication
{
    public interface IJwtService
    {
        string GenerateAccessToken(int userId, string email, string fullName, List<string> roles);
        string GenerateRefreshToken();
    }
}
