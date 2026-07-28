using Linkdev.MOS.SuperApp.Business.DTOs.Files;
using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Filters;
using Linkdev.MOS.SuperApp.Business.Interfaces.Files;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.Files
{
    [Route("api/files")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.ServiceIntroPage)]
    public class FilesController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FilesController(IFileService fileService)
        {
            _fileService = fileService;
        }

        // POST: api/files
        [HttpPost]
        [HasAnyPermission(PermissionAction.Add, PermissionAction.Edit)]
        public async Task<ActionResult<UploadedFileDto>> Upload(
            IFormFile file,
            [FromForm] FileCategory category)
        {
            try
            {
                var result = await _fileService.UploadAsync(file, category);
                result.Url = $"{Request.Scheme}://{Request.Host}{result.Url}";
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
