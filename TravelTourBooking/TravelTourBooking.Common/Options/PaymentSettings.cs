namespace TravelTourBooking.Common.Options;

public class PaymentSettings
{
    /// <summary>Đường dẫn ảnh QR MoMo trong wwwroot, vd. /images/payment/momo-qr.jpg</summary>
    public string MoMoQrPath { get; set; } = "/images/payment/momo-qr.jpg";

    public string MoMoAccountName { get; set; } = "Travel Tour Booking";

    public string MoMoPhone { get; set; } = "";

    public string BankName { get; set; } = "";

    public string BankAccountNumber { get; set; } = "";

    public string BankAccountName { get; set; } = "";

    /// <summary>Tiền tố nội dung CK: TT + BookingId</summary>
    public string TransferNotePrefix { get; set; } = "TT";
}
