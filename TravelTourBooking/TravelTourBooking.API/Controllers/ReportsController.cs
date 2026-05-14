using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

/// <summary>Báo cáo doanh thu và thống kê hệ thống — chỉ Admin</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>Doanh thu theo từng tour</summary>
    /// <remarks>Truy vấn từ view <c>vw_TourRevenue</c>. Chỉ tính booking Confirmed/Completed.</remarks>
    /// <response code="200">Danh sách doanh thu theo tour</response>
    /// <response code="401">Chưa đăng nhập</response>
    /// <response code="403">Không phải Admin</response>
    [HttpGet("revenue")]
    [ProducesResponseType(typeof(IEnumerable<TourRevenueDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetTourRevenue()
    {
        var data = await _reportService.GetTourRevenueAsync();
        return Ok(data);
    }

    /// <summary>Tour phổ biến nhất</summary>
    /// <remarks>Truy vấn từ view <c>vw_PopularTours</c>. Xếp hạng theo AVG Rating và lượt đặt.</remarks>
    /// <response code="200">Danh sách tour phổ biến</response>
    [HttpGet("popular-tours")]
    [ProducesResponseType(typeof(IEnumerable<PopularTourDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPopularTours()
    {
        var data = await _reportService.GetPopularToursAsync();
        return Ok(data);
    }

    /// <summary>Doanh thu theo tháng</summary>
    /// <remarks>
    /// Gọi stored procedure <c>sp_RevenueReport</c>.  
    /// Cả hai tham số đều optional — nếu bỏ trống sẽ lấy toàn bộ lịch sử.
    /// </remarks>
    /// <param name="fromDate">Ngày bắt đầu (yyyy-MM-dd), có thể để trống</param>
    /// <param name="toDate">Ngày kết thúc (yyyy-MM-dd), có thể để trống</param>
    /// <response code="200">Doanh thu GROUP BY tháng</response>
    /// <response code="400">FromDate lớn hơn ToDate hoặc khoảng thời gian vượt 5 năm</response>
    [HttpGet("revenue-by-month")]
    [ProducesResponseType(typeof(IEnumerable<MonthlyRevenueDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetRevenueByMonth(
        [FromQuery] DateOnly? fromDate,
        [FromQuery] DateOnly? toDate)
    {
        try
        {
            var data = await _reportService.GetMonthlyRevenueAsync(fromDate, toDate);
            return Ok(data);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Tỷ lệ lấp đầy (Occupancy Rate)</summary>
    /// <remarks>
    /// Trả về % chỗ đã bán / tổng chỗ cho từng lịch khởi hành còn hiệu lực.  
    /// Chỉ trả về các lịch có ngày khởi hành &gt;= hôm nay.
    /// </remarks>
    /// <response code="200">Danh sách tỷ lệ lấp đầy theo lịch khởi hành</response>
    [HttpGet("occupancy")]
    [ProducesResponseType(typeof(IEnumerable<OccupancyRateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetOccupancyRates()
    {
        var data = await _reportService.GetOccupancyRatesAsync();
        return Ok(data);
    }
}
