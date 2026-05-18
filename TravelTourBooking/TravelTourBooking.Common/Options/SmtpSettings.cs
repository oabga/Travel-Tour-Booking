namespace TravelTourBooking.Common.Options;

public class SmtpSettings
{
    public bool Enabled { get; set; }
    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string? User { get; set; }
    public string? Password { get; set; }
    public string FromEmail { get; set; } = "noreply@traveltour.com";
    public string FromName { get; set; } = "TravelTour Booking";
}
