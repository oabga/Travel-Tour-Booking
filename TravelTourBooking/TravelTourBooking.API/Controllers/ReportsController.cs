using Microsoft.AspNetCore.Mvc;

namespace TravelTourBooking.API.Controllers
{
    public class ReportsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
