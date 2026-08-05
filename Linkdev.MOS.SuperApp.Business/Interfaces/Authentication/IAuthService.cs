using LinkDev.MOS.SuperApp.Business.Dtos.Authentication;

namespace LinkDev.MOS.SuperApp.Business.Interfaces.Authentication
{
    public interface IAuthService
    {
        Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto RegDto);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto LogDto);
        Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
        Task LogoutAsync(RefreshTokenRequestDto dto);
    }
}
