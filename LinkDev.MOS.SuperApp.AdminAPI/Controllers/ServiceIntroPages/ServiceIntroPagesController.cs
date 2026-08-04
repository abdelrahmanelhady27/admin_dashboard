using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using LinkDev.MOS.SuperApp.Domain.Enums;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using LinkDev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.ServiceIntroPages
{
    [Route("api/service-intro-pages")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.ServiceIntroPage)]
    public class ServiceIntroPagesController : ControllerBase
    {
        private readonly IServiceIntroPageService _service;

        public ServiceIntroPagesController(IServiceIntroPageService service)
        {
            _service = service;
        }

        // GET: api/service-intro-pages
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<IEnumerable<ServiceIntroPageDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? status)
        {
            try
            {
                var pages = await _service.GetAllAsync(search, status);
                return Ok(pages);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/service-intro-pages/available-services
        [HttpGet("available-services")]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<IEnumerable<LinkedServiceDto>>> GetAvailableServices()
        {
            try
            {
                var services = await _service.GetAvailableServicesAsync();
                return Ok(services);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/service-intro-pages/published/{serviceId}
        [HttpGet("published/{serviceId:int}")]
        [AllowAnonymous]
        public async Task<ActionResult<ServiceIntroPageDto>> GetPublishedByServiceId(int serviceId)
        {
            try
            {
                var page = await _service.GetPublishedByServiceIdAsync(serviceId);
                if (page == null)
                {
                    return NotFound(new { message = "Published service details page not found." });
                }
                return Ok(page);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/service-intro-pages/5
        [HttpGet("{id:int}")]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<ServiceIntroPageDto>> GetById(int id)
        {
            try
            {
                var page = await _service.GetByIdAsync(id);
                if (page == null)
                {
                    return NotFound(new { message = "Service details page not found." });
                }
                return Ok(page);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/service-intro-pages
        [HttpPost]
        [HasPermission(PermissionAction.Add)]
        public async Task<ActionResult<ServiceIntroPageDto>> Create([FromBody] CreateServiceIntroPageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var page = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = page.Id }, page);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/service-intro-pages/5
        [HttpPut("{id:int}")]
        [HasPermission(PermissionAction.Edit)]
        public async Task<ActionResult<ServiceIntroPageDto>> Update(int id, [FromBody] UpdateServiceIntroPageDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var page = await _service.UpdateAsync(id, dto);
                if (page == null)
                {
                    return NotFound(new { message = "Service details page not found." });
                }
                return Ok(page);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/service-intro-pages/5/publish
        [HttpPost("{id:int}/publish")]
        [HasPermission(PermissionAction.Publish)]
        public async Task<ActionResult<ServiceIntroPageDto>> Publish(int id)
        {
            try
            {
                var page = await _service.PublishAsync(id);
                if (page == null)
                {
                    return NotFound(new { message = "Service details page not found." });
                }
                return Ok(page);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/service-intro-pages/5/unpublish
        [HttpPost("{id:int}/unpublish")]
        [HasPermission(PermissionAction.Publish)]
        public async Task<ActionResult<ServiceIntroPageDto>> Unpublish(int id)
        {
            try
            {
                var page = await _service.UnpublishAsync(id);
                if (page == null)
                {
                    return NotFound(new { message = "Service details page not found." });
                }
                return Ok(page);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/service-intro-pages/5
        [HttpDelete("{id:int}")]
        [HasPermission(PermissionAction.Delete)]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Service details page not found." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
