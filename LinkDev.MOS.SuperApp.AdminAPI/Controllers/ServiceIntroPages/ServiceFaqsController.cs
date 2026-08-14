using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage.ServiceFaq;
using LinkDev.MOS.SuperApp.Business.Interfaces.ServiceIntroPages;
using LinkDev.MOS.SuperApp.Domain.Enums;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.ServiceIntroPages
{
    [Route("api/service-faqs")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.ServiceIntroPage)]
    public class ServiceFaqsController : ControllerBase
    {
        private readonly IServiceFaqService _service;

        public ServiceFaqsController(IServiceFaqService service)
        {
            _service = service;
        }

        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<PagedResult<ServiceFaqDto>>> GetAll([FromQuery] ServiceFaqSearchDto request)
        {
            try
            {
                return Ok(await _service.GetAllAsync(request));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<ServiceFaqDto>> GetById(int id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { message = "Service FAQ not found." });
                }

                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [HasPermission(PermissionAction.Add)]
        public async Task<ActionResult<ServiceFaqDto>> Create([FromBody] CreateServiceFaqDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        [HasPermission(PermissionAction.Edit)]
        public async Task<ActionResult<ServiceFaqDto>> Update(int id, [FromBody] UpdateServiceFaqDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var item = await _service.UpdateAsync(id, dto);
                if (item == null)
                {
                    return NotFound(new { message = "Service FAQ not found." });
                }

                return Ok(item);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        [HasPermission(PermissionAction.Delete)]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteAsync(id);
                if (!success)
                {
                    return NotFound(new { message = "Service FAQ not found." });
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
