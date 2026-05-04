using Microsoft.AspNetCore.Mvc;

namespace TravelTourBooking.API.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
