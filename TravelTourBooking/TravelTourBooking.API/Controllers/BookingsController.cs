using Microsoft.AspNetCore.Mvc;

namespace TravelTourBooking.API.Controllers
{
    public class BookingsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
