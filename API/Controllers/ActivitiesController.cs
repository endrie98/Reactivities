using Application.Activities;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        [HttpGet] // api/activities

        public async Task<ActionResult<List<Activity>>> GetActivities() 
        {
            return await Mediator.Send(new List.Query());
        }

        [HttpGet("{id}")] // api/activities/:id

        public async Task<ActionResult<Activity>> GetActivity(Guid id) 
        {
            return await Mediator.Send(new Details.Query{Id = id});
        }

        [HttpPost] // Create Activity
        public async Task<IActionResult> CreateActivity(Activity activity)
        {
            await Mediator.Send(new Create.Command {Activity = activity});

            return Ok();
        }

        [HttpPut("{id}")] // Edit Activity
        public async Task<IActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id;

            await Mediator.Send(new Edit.Command {Activity = activity});

            return Ok();
        }

        [HttpDelete("{id}")] // Delete Activity
        public async Task<IActionResult> DeleteActivity(Guid id)
        {
            await Mediator.Send(new Delete.Command {Id = id});

            return Ok();
        }
    }
}