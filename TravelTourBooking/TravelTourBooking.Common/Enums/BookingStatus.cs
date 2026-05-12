namespace TravelTourBooking.Common.Enums;

/// <summary>
/// Trạng thái Booking — tương ứng CHECK constraint trong SQL.
/// </summary>
public enum BookingStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}
