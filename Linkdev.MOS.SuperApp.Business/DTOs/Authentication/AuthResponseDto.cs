using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Business.Dtos.Authentication
{
    public class AuthResponseDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
    }
}
