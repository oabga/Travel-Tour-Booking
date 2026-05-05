using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers
{
    [ApiController]
    [Route("api/schedules")]
    [Produces("application/json")]
    public class SchedulesController(IScheduleService svc) : ControllerBase
    {
        /// <summary>Tất cả lịch khởi hành</summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ScheduleResponseDto>>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var items = await svc.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<ScheduleResponseDto>>.Ok(items));
        }

        /// <summary>Chi tiết một lịch</summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<ScheduleResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await svc.GetByIdAsync(id);
            if (item is null)
                return NotFound(ApiResponse<string>.Fail($"Lịch ID {id} không tồn tại."));

            return Ok(ApiResponse<ScheduleResponseDto>.Ok(item));
        }

        /// <summary>Lịch theo tour — dùng trong trang chi tiết tour</summary>
        [HttpGet("tour/{tourId:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ScheduleResponseDto>>), 200)]
        public async Task<IActionResult> GetByTour(int tourId)
        {
            var items = await svc.GetByTourAsync(tourId);
            return Ok(ApiResponse<IEnumerable<ScheduleResponseDto>>.Ok(items));
        }

        /// <summary>Thêm lịch khởi hành [Admin]</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<ScheduleResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<string>), 400)]
        public async Task<IActionResult> Create([FromBody] ScheduleRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var created = await svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.ScheduleId },
                ApiResponse<ScheduleResponseDto>.Ok(created, "Tạo lịch khởi hành thành công."));
        }

        /// <summary>Cập nhật lịch [Admin]</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<ScheduleResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> Update(int id, [FromBody] ScheduleRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var updated = await svc.UpdateAsync(id, dto);
            return Ok(ApiResponse<ScheduleResponseDto>.Ok(updated, "Cập nhật lịch thành công."));
        }

        /// <summary>Xóa lịch [Admin]</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> Delete(int id)
        {
            await svc.DeleteAsync(id);
            return Ok(ApiResponse<string>.Ok("deleted", "Xóa lịch thành công."));
        }
    }
}
