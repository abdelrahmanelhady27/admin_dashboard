using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.User;
using LinkDev.MOS.SuperApp.Business.Interfaces.Users;
using LinkDev.MOS.SuperApp.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.Users
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = AppRoles.SuperAdmin)]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // GET: api/users
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserDto>>> GetAll(
            [FromQuery] UserSearchDto request)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(request);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/users
        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto createUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userService.CreateUserAsync(createUserDto);
                return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/users/5/permissions
        [HttpPut("{id}/permissions")]
        public async Task<ActionResult<UserDto>> UpdatePermissions(int id, [FromBody] List<PermissionSetDto> permissions)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userService.UpdateUserPermissionsAsync(id, permissions);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/users/5/suspend
        [HttpPatch("{id}/suspend")]
        public async Task<ActionResult<UserDto>> Suspend(int id)
        {
            try
            {
                var user = await _userService.SuspendUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/users/5/activate
        [HttpPatch("{id}/activate")]
        public async Task<ActionResult<UserDto>> Activate(int id)
        {
            try
            {
                var user = await _userService.ActivateUserAsync(id);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/users/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _userService.DeleteUserAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "User not found." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/users/static/search
        [HttpGet("static/search")]
        public async Task<ActionResult<IEnumerable<StaticUserDto>>> SearchStatic([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return BadRequest(new { message = "Please enter search data" });
            }

            try
            {
                var staticUsers = await _userService.SearchStaticUsersAsync(term);
                return Ok(staticUsers);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
