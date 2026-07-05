using System;
using System.Collections.Generic;
using System.Text;

namespace LinkDev.MOS.SuperApp.Identity.Options
{
    public class JwtOptions
    {
        public string SecretKey { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public double ExpiryInMinutes { get; set; }
    }
}
