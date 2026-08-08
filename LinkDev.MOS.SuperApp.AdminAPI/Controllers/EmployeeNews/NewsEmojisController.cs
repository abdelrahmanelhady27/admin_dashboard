using LinkDev.MOS.SuperApp.Business.DTOs.Common;
using LinkDev.MOS.SuperApp.Business.DTOs.EmployeeNews.NewsEmoji;
using LinkDev.MOS.SuperApp.Business.Interfaces.EmployeeNews;
using LinkDev.MOS.SuperApp.Domain.Enums;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.EmployeeNews
{
    [Route("api/news-emojis")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.EmployeeNews)]
    public class NewsEmojisController : ControllerBase
    {
        private readonly INewsEmojiService _service;

        public NewsEmojisController(INewsEmojiService service)
        {
            _service = service;
        }

        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public async Task<ActionResult<PagedResult<NewsEmojiDto>>> GetAll([FromQuery] NewsEmojiSearchDto request)
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
        public async Task<ActionResult<NewsEmojiDto>> GetById(int id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null)
                {
                    return NotFound(new { message = "News emoji not found." });
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
        public async Task<ActionResult<NewsEmojiDto>> Create([FromBody] CreateNewsEmojiDto dto)
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
        public async Task<ActionResult<NewsEmojiDto>> Update(int id, [FromBody] UpdateNewsEmojiDto dto)
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
                    return NotFound(new { message = "News emoji not found." });
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
                    return NotFound(new { message = "News emoji not found." });
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
