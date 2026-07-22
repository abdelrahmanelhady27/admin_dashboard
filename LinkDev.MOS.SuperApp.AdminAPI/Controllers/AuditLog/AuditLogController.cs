using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Filters;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.AuditLog
{
    [Route("api/audit-log")]
    [ApiController]
    [HasFeature(FeatureType.AuditLog)]
    public class AuditLogController : ControllerBase
    {
        // GET: api/audit-log
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/audit-log/5
        [HttpGet("{id}")]
        [HasPermission(PermissionAction.Read)]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/audit-log
        [HttpPost]
        [HasPermission(PermissionAction.Add)]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/audit-log/5
        [HttpPut("{id}")]
        [HasPermission(PermissionAction.Edit)]

        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/audit-log/5
        [HttpDelete("{id}")]
        [HasPermission(PermissionAction.Delete)]

        public void Delete(int id)
        {
        }
    }
}
