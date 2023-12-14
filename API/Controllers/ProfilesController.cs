using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfilesController : BaseApiController
    {
        [HttpGet("{username}")]
        public async Task<IActionResult> GetProfile(string username)
        {
            // this new Details.Query must be from Aplication.Profiles ... take care coz another class with Details name is in Aplication.Activities
            return HandleResult(await Mediator.Send(new Details.Query{Username = username}));
        }
    }
}