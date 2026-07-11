using Linkdev.MOS.SuperApp.Business.Entites;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.Permissions
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class UserPermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;

        public UserPermissionsController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        // GET: api/UserPermissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserPermission>>> GetAll()
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            return Ok(permissions);
        }

        // GET: api/UserPermissions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserPermission>> GetById(int id)
        {
            var permission = await _permissionService.GetPermissionByIdAsync(id);
            if (permission == null)
            {
                return NotFound();
            }
            return Ok(permission);
        }

        // GET: api/UserPermissions/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserPermission>>> GetByUserId(int userId)
        {
            var permissions = await _permissionService.GetPermissionsByUserIdAsync(userId);
            return Ok(permissions);
        }

        // POST: api/UserPermissions
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] UserPermission permission)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _permissionService.CreatePermissionAsync(permission);
            return CreatedAtAction(nameof(GetById), new { id = permission.Id }, permission);
        }

        // PUT: api/UserPermissions/5
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UserPermission permission)
        {
            if (id != permission.Id)
            {
                return BadRequest("ID mismatch");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingPermission = await _permissionService.GetPermissionByIdAsync(id);
            if (existingPermission == null)
            {
                return NotFound();
            }

            await _permissionService.UpdatePermissionAsync(permission);
            return NoContent();
        }

        // DELETE: api/UserPermissions/5
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existingPermission = await _permissionService.GetPermissionByIdAsync(id);
            if (existingPermission == null)
            {
                return NotFound();
            }

            await _permissionService.DeletePermissionAsync(id);
            return NoContent();
        }
    }
}
