using LinkDev.MOS.SuperApp.Domain.Enums;
using LinkDev.MOS.SuperApp.AdminAPI.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.EmployeeNews
{
    [Route("api/employee-news")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.EmployeeNews)]
    public class EmployeeNewsController : ControllerBase
    {
        // GET: api/employee-news
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/employee-news/5
        [HttpGet("{id}")]
        [HasPermission(PermissionAction.Read)]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/employee-news
        [HttpPost]
        [HasPermission(PermissionAction.Add)]

        public void Post([FromBody] string value)
        {
            
        }

        // PUT api/employee-news/5
        [HttpPut("{id}")]
        [HasPermission(PermissionAction.Edit)]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/employee-news/5
        [HttpDelete("{id}")]
        [HasPermission(PermissionAction.Delete)]
        public void Delete(int id)
        {
        }
    }
}
