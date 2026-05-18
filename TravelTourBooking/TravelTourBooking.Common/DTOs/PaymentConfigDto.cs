namespace TravelTourBooking.Common.DTOs;

public class PaymentConfigDto
{
    public string MoMoQrUrl { get; set; } = string.Empty;
    public string MoMoAccountName { get; set; } = string.Empty;
    public string MoMoPhone { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public string BankAccountName { get; set; } = string.Empty;
    public string TransferNotePrefix { get; set; } = "TT";
}
