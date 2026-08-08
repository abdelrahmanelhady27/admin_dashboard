using LinkDev.MOS.SuperApp.Business.DTOs.QuickLinks;
using LinkDev.MOS.SuperApp.Business.DTOs.ServiceIntroPage;
using LinkDev.MOS.SuperApp.Domain.Enums;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using LinkDev.MOS.SuperApp.Business.Interfaces.QuickLinks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.QuickLinks
{
    [Route("api/quick-links")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.QuickLinks)]
    public class QuickLinksController : ControllerBase
    {
        private readonly IQuickLinkService _service;

        public QuickLinksController(IQuickLinkService service)
        {
            _service = service;
        }

        // GET: api/quick-links
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<IEnumerable<QuickLinkDto>>> GetAll()
        {
            try
            {
                var links = await _service.GetAllAsync();
                return Ok(links);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/quick-links/available-services
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

        // PUT: api/quick-links
        [HttpPut]
        [HasPermission(PermissionAction.Add, PermissionAction.Edit, PermissionAction.Delete)]
        public async Task<ActionResult<IEnumerable<QuickLinkDto>>> Save([FromBody] SaveQuickLinksDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var links = await _service.SaveAsync(dto);
                return Ok(links);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
