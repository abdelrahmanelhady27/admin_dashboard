using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.EmployeeNews
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [HasFeature(FeatureType.EmployeeNews)]
    public class EmployeeNewsController : ControllerBase
    {
        // GET: api/EmployeeNews
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/EmployeeNews/5
        [HttpGet("{id}")]
        [HasPermission(PermissionAction.Read)]
        public string Get(int id)
        {
            return "value";
        }

        // POST api/EmployeeNews
        [HttpPost]
        [HasPermission(PermissionAction.Add)]

        public void Post([FromBody] string value)
        {
            
        }

        // PUT api/EmpolyeeNews/5
        [HttpPut("{id}")]
        [HasPermission(PermissionAction.Edit)]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/EmployeeNews/5
        [HttpDelete("{id}")]
        [HasPermission(PermissionAction.Delete)]
        public void Delete(int id)
        {
        }
    }
}
