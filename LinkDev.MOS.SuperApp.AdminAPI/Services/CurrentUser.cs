using LinkDev.MOS.SuperApp.Business.Interfaces;
using System.Security.Claims;

namespace LinkDev.MOS.SuperApp.AdminAPI.Services
{
    public class CurrentUser : ICurrentUser
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUser(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

        public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

        public int? UserId
        {
            get
            {
                var value = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return int.TryParse(value, out var id) ? id : null;
            }
        }

        public bool IsInRole(string role) => User?.IsInRole(role) == true;

        public string DisplayName
        {
            get
            {
                if (!IsAuthenticated)
                {
                    return "System";
                }

                var name = User!.FindFirst(ClaimTypes.Name)?.Value
                    ?? User.FindFirst("name")?.Value;
                if (!string.IsNullOrWhiteSpace(name))
                {
                    return name;
                }

                var email = User.FindFirst(ClaimTypes.Email)?.Value
                    ?? User.FindFirst("email")?.Value;
                if (!string.IsNullOrWhiteSpace(email))
                {
                    return email;
                }

                return "System";
            }
        }
    }
}
