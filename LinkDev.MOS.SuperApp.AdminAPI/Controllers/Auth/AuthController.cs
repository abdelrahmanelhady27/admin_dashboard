using LinkDev.MOS.SuperApp.Business.Dtos.Authentication;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using LinkDev.MOS.SuperApp.Business.Interfaces.Authentication;
using LinkDev.MOS.SuperApp.Business.Interfaces.Users;
using LinkDev.MOS.SuperApp.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Linkdev.MOS.SuperApp.AdminAPI.Controllers.Auth
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public AuthController(
            IAuthService authService,
            IUserService userService)
        {
            _authService = authService;
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
        [Authorize(Roles = AppRoles.SuperAdmin)]
        public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterRequestDto RegDto)
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
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto LoginDto)
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

        // POST api/auth/refresh-token
        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(dto);
                return Ok(result);
            }
            catch (Exception ex) when (ex.Message == "Invalid refresh token.")
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while refreshing the token.");
            }
        }

        // POST api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
        {
            try
            {
                await _authService.LogoutAsync(dto);
                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while logging out.");
            }
        }
    }
}
