using Azure.Core;
using LinkDev.MOS.SuperApp.Business.Dtos.Authentication;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using Linkdev.MOS.SuperApp.Identity.Entites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using LinkDev.MOS.SuperApp.Business.Interfaces.Authentication;
using LinkDev.MOS.SuperApp.Business.Interfaces.Users;

namespace Linkdev.MOS.SuperApp.AdminAPI.Controllers.Auth
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IUserService _userService;

        public AuthController(
            IAuthService authService,
            SignInManager<ApplicationUser> signInManager,
            IUserService userService)
        {
            _authService = authService;
            _signInManager = signInManager;
            _userService = userService;
        }

        // GET api/auth/my-permissions
        [HttpGet("my-permissions")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<PermissionSetDto>>> MyPermissions()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var userDto = await _userService.GetUserByIdAsync(userId);
            if (userDto == null) return NotFound();

            return Ok(userDto.Permissions);
        }

        // POST api/auth/register
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
