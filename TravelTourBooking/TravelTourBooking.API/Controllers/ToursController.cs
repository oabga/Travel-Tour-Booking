using Microsoft.AspNetCore.Mvc;

namespace TravelTourBooking.API.Controllers
{
    public class ToursController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
