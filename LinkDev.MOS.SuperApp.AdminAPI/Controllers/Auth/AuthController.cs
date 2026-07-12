using Azure.Core;
using Linkdev.MOS.SuperApp.Business.Dtos.Authentication;
using Linkdev.MOS.SuperApp.Business.Entites.Identity;
using Linkdev.MOS.SuperApp.Business.Interfaces.Services.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.Auth
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthController(
            IAuthService authService,
            SignInManager<ApplicationUser> signInManager)
        {
            _authService = authService;
            _signInManager = signInManager;
        }

        // POST api/auth/createAdmin
        [HttpPost("register")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<ActionResult<RegisterRequestDto>> Register([FromBody] RegisterRequestDto RegDto)
        {

            try
            {
                var result = await _authService.RegisterAsync(RegDto);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message.Contains("already exists") || ex.Message.Contains("failed"))
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while registering the user");
            }
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginRequestDto>> Login([FromBody] LoginRequestDto LoginDto)
        {

            try
            {
                var result = await _authService.LoginAsync(LoginDto);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message == "Invalid email or password.")
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while logging in.");
            }
        }
    }
}
