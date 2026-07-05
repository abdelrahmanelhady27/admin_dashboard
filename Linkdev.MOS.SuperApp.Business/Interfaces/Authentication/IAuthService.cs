using Linkdev.MOS.SuperApp.Business.DTOs.Authentication;
using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Authentication
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterRequestDto RegDto);
        Task<AuthResponseDto> LoginAsync(LoginRequestDto LogDto);
        Task LogoutAsync(int userId);
    }
}
