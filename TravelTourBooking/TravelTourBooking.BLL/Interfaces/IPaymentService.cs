using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface IPaymentService 
    {
        /// <summary>
        /// payment của 1 booking
        /// </summary>
        Task<int> CreatePaymentAsync(CreatePaymentDto dto);

        /// <summary>
        /// lịch sử payment của 1 booking
        /// </summary>
        Task<IEnumerable<PaymentDto>> GetPaymentsByBookingAsync(int bookingId);

        /// <summary>
        /// lấy số tiền đã trả
        /// </summary>
        Task<decimal> GetTotalPaidAsync(int bookingId);

        /// <summary>
        /// lấy số tiền còn nợ
        /// </summary>
        Task<decimal> GetRemainingAmountAsync(int bookingId);
    }
}
