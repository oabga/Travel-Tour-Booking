using System;

namespace TravelTourBooking.DAL.EFCore.Entities;

public class CustomerProfile
{
    public int AccountId { get; set; }
    public string FullName { get; set; } = null!;
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public Account Account { get; set; } = null!;
}