using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Filters;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.AuditLog
{
    [Route("api/[controller]")]
    [ApiController]
    [HasFeature(FeatureType.AuditLog)]
    public class AuditLogController : ControllerBase
    {
        // GET: api/<AuditLogController>
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<AuditLogController>/5
        [HttpGet("{id}")]
        [HasPermission(PermissionAction.Read)]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<AuditLogController>
        [HttpPost]
        [HasPermission(PermissionAction.Add)]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/<AuditLogController>/5
        [HttpPut("{id}")]
        [HasPermission(PermissionAction.Edit)]

        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<AuditLogController>/5
        [HttpDelete("{id}")]
        [HasPermission(PermissionAction.Delete)]

        public void Delete(int id)
        {
        }
    }
}
