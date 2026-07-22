using Linkdev.MOS.SuperApp.Business.DTOs.UserPermission;
using Linkdev.MOS.SuperApp.Business.Interfaces;
using Linkdev.MOS.SuperApp.Business.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.Permissions
{
    [Route("api/permissions")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin")]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionService _permissionService;

        public PermissionsController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        // GET: api/permissions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserPermissionDto>>> GetAll()
        {
            var permissions = await _permissionService.GetAllPermissionsAsync();
            return Ok(permissions);
        }

        // GET: api/permissions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserPermissionDto>> GetById(int id)
        {
            var permission = await _permissionService.GetPermissionByIdAsync(id);
            if (permission == null)
            {
                return NotFound();
            }
            return Ok(permission);
        }

        // GET: api/permissions/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserPermissionDto>>> GetByUserId(int userId)
        {
            var permissions = await _permissionService.GetPermissionsByUserIdAsync(userId);
            return Ok(permissions);
        }

        // POST: api/permissions
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] UserPermissionDto permissionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _permissionService.CreatePermissionAsync(permissionDto);
            return CreatedAtAction(nameof(GetById), new { id = permissionDto.Id }, permissionDto);
        }

        // PUT: api/permissions/5
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] UserPermissionDto permissionDto)
        {
            if (id != permissionDto.Id)
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

            await _permissionService.UpdatePermissionAsync(permissionDto);
            return NoContent();
        }

        // DELETE: api/permissions/5
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
