using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    [Produces("application/json")]
    public class CategoriesController(ICategoryService svc) : ControllerBase
    {
        /// <summary>Lấy tất cả danh mục</summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<CategoryResponseDto>>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var items = await svc.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<CategoryResponseDto>>.Ok(items));
        }

        /// <summary>Chi tiết danh mục</summary>
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<CategoryResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await svc.GetByIdAsync(id);
            if (item is null)
                return NotFound(ApiResponse<string>.Fail($"Danh mục ID {id} không tồn tại."));

            return Ok(ApiResponse<CategoryResponseDto>.Ok(item));
        }

        /// <summary>Thêm danh mục [Admin]</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<CategoryResponseDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<string>), 409)]
        public async Task<IActionResult> Create([FromBody] CategoryRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var created = await svc.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.CateId },
                ApiResponse<CategoryResponseDto>.Ok(created, "Tạo danh mục thành công."));
        }

        /// <summary>Cập nhật danh mục [Admin]</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<CategoryResponseDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> Update(int id, [FromBody] CategoryRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var updated = await svc.UpdateAsync(id, dto);
            return Ok(ApiResponse<CategoryResponseDto>.Ok(updated, "Cập nhật danh mục thành công."));
        }

        /// <summary>Xóa danh mục [Admin]</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> Delete(int id)
        {
            await svc.DeleteAsync(id);
            return Ok(ApiResponse<string>.Ok("deleted", "Xóa danh mục thành công."));
        }
    }
}
