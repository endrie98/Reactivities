using Application.Activities;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers
{
    public class ActivitiesController : BaseApiController
    {
        [HttpGet] // api/activities

        public async Task<IActionResult> GetActivities() 
        {
            var result = await Mediator.Send(new List.Query());
            
            return HandleResult(result);
        }

        [HttpGet("{id}")] // api/activities/:id

        public async Task<IActionResult> GetActivity(Guid id) 
        {
            var result = await Mediator.Send(new Details.Query{Id = id});
            
            return HandleResult(result);
        }

        [HttpPost] // Create Activity
        public async Task<IActionResult> CreateActivity(Activity activity)
        {
            var result = await Mediator.Send(new Create.Command {Activity = activity});

            return HandleResult(result);
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpPut("{id}")] // Edit Activity
        public async Task<IActionResult> EditActivity(Guid id, Activity activity)
        {
            activity.Id = id;

            var result = await Mediator.Send(new Edit.Command {Activity = activity});

            return HandleResult(result);
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpDelete("{id}")] // Delete Activity
        public async Task<IActionResult> DeleteActivity(Guid id)
        {
            var result = await Mediator.Send(new Delete.Command {Id = id});

            return HandleResult(result);
        }

        [HttpPost("{id}/attend")]
        public async Task<IActionResult> Attend(Guid id)
        {
            var result = await Mediator.Send(new UpdateAttendance.Command{Id = id});

            return HandleResult(result);
        }
    }
}