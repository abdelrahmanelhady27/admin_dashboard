using Linkdev.MOS.SuperApp.Business.Enums;
using Linkdev.MOS.SuperApp.Business.Filters;
using Microsoft.AspNetCore.Mvc;


namespace LinkDev.MOS.SuperApp.AdminAPI.Controllers.QuickLinks
{
    [Route("api/quick-links")]
    [ApiController]
    [HasFeature(FeatureType.QuickLinks)]
    public class QuickLinksController : ControllerBase
    {
        // GET: api/quick-links
        [HttpGet]
        [HasPermission(PermissionAction.Read)]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/quick-links/5
        [HttpGet("{id}")]
        [HasPermission(PermissionAction.Read)]

        public string Get(int id)
        {
            return "value";
        }

        // POST api/quick-links
        [HttpPost]
        [HasPermission(PermissionAction.Add)]

        public void Post([FromBody] string value)
        {
        }

        // PUT api/quick-links/5
        [HttpPut("{id}")]
        [HasPermission(PermissionAction.Edit)]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/quick-links/5
        [HttpDelete("{id}")]
        [HasPermission(PermissionAction.Delete)]

        public void Delete(int id)
        {
        }
    }
}
