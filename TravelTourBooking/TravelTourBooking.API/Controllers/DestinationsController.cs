using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers
{
    [ApiController]
    [Route("api/destinations")]
    [Produces("application/json")]
    public class DestinationsController(IDestinationService svc) : ControllerBase
    {
        /// <summary>Lấy tất cả điểm đến</summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<DestinationResponseDto>>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var items = await svc.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<DestinationResponseDto>>.Ok(items));
        }

        /// <summary>Chi tiết điểm đến</summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<DestinationResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await svc.GetByIdAsync(id);
            if (item is null)
                return NotFound(ApiResponse<string>.Fail($"Điểm đến ID {id} không tồn tại."));

            return Ok(ApiResponse<DestinationResponseDto>.Ok(item));
        }

        /// <summary>Thêm điểm đến [Admin]</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<DestinationResponseDto>), 201)]
        public async Task<IActionResult> Create([FromBody] DestinationRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var created = await svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.DesId },
                ApiResponse<DestinationResponseDto>.Ok(created, "Tạo điểm đến thành công."));
        }

        /// <summary>Cập nhật điểm đến [Admin]</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<DestinationResponseDto>), 200)]
        public async Task<IActionResult> Update(int id, [FromBody] DestinationRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var updated = await svc.UpdateAsync(id, dto);
            return Ok(ApiResponse<DestinationResponseDto>.Ok(updated, "Cập nhật điểm đến thành công."));
        }

        /// <summary>Xóa điểm đến [Admin]</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        public async Task<IActionResult> Delete(int id)
        {
            await svc.DeleteAsync(id);
            return Ok(ApiResponse<string>.Ok("deleted", "Xóa điểm đến thành công."));
        }
    }
}
