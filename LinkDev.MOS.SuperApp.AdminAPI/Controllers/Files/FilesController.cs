using LinkDev.MOS.SuperApp.Business.DTOs.Files;
using LinkDev.MOS.SuperApp.Business.Interfaces.Files;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using LinkDev.MOS.SuperApp.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.Files
{
    [Route("api/files")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.ServiceIntroPage, FeatureType.EmployeeNews)]
    public class FilesController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FilesController(IFileService fileService)
        {
            _fileService = fileService;
        }

        // POST: api/files
        [HttpPost]
        [HasPermission(PermissionAction.Add, PermissionAction.Edit)]
        public async Task<ActionResult<UploadedFileDto>> Upload(
            IFormFile file,
            [FromForm] FileCategory category)
        {
            try
            {
                if (file == null)
                {
                    return BadRequest(new { message = "No file was provided." });
                }

                await using var stream = file.OpenReadStream();
                var request = new FileUploadRequest
                {
                    Content = stream,
                    FileName = file.FileName,
                    ContentType = file.ContentType ?? string.Empty,
                    Length = file.Length
                };

                var result = await _fileService.UploadAsync(request, category);
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
