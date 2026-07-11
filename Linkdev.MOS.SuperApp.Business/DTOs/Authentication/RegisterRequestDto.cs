using System;
using System.Collections.Generic;
using System.Text;

namespace Linkdev.MOS.SuperApp.Business.Dtos.Authentication
{
    public class RegisterRequestDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
