using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Interfaces.Services.Authentication
{
    public interface IJwtService
    {
        string GenerateAccessToken(int userId, string email, string fullName, List<string> roles);
    }
}
