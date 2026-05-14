using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers
{
    [ApiController]
    [Route("api/tours")]
    [Produces("application/json")]
    public class ToursController(ITourService svc) : ControllerBase
    {
        // ── GET /api/tours?page=1&pageSize=10&cateId=&desId=&priceMin=&priceMax=
        //Danh sách tour — phân trang và lọc theo danh mục, điểm đến, khoảng giá
        //chỉ admin, staff mới dc xem
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<TourListDto>>), 200)]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? cateId = null,
            [FromQuery] int? desId = null,
            [FromQuery] decimal? priceMin = null,
            [FromQuery] decimal? priceMax = null)
        {
            if (page < 1 || pageSize < 1 || pageSize > 100)
                return BadRequest(ApiResponse<string>.Fail("page/pageSize không hợp lệ."));

            var result = await svc.GetToursAsync(page, pageSize, cateId, desId, priceMin, priceMax);
            return Ok(ApiResponse<PagedResult<TourListDto>>.Ok(result));
        }

        // ── GET /api/tours/search?destination=&priceMin=&priceMax=&date=
        //Tìm kiếm nâng cao — gọi sp_SearchTours qua ADO.NET
        [HttpGet("search")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), 200)]
        public async Task<IActionResult> Search(
            [FromQuery] string? destination = null,
            [FromQuery] decimal? priceMin = null,
            [FromQuery] decimal? priceMax = null,
            [FromQuery] DateOnly? date = null)
        {
            var results = await svc.SearchToursAsync(destination, priceMin, priceMax, date);
            return Ok(ApiResponse<IEnumerable<object>>.Ok(results.Cast<object>()));
        }

        // ── GET /api/tours/popular
        //Tour phổ biến — truy vấn vw_PopularTours
        [HttpGet("popular")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), 200)]
        public async Task<IActionResult> GetPopular()
        {
            var results = await svc.GetPopularToursAsync();
            return Ok(ApiResponse<IEnumerable<object>>.Ok(results.Cast<object>()));
        }

        // ── GET /api/tours/{id}
        //Chi tiết tour — kèm lịch khởi hành và điểm đánh giá trung bình
        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<TourDetailDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> GetById(int id)
        {
            var tour = await svc.GetTourDetailAsync(id);
            if (tour is null)
                return NotFound(ApiResponse<string>.Fail($"Tour ID {id} không tồn tại."));

            return Ok(ApiResponse<TourDetailDto>.Ok(tour));
        }

        // ── POST /api/tours
        //Thêm tour mới — chỉ Admin
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<TourDetailDto>), 201)]
        [ProducesResponseType(typeof(ApiResponse<string>), 400)]
        public async Task<IActionResult> Create([FromBody] TourRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var created = await svc.CreateTourAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.TourId },
                ApiResponse<TourDetailDto>.Ok(created, "Tạo tour thành công."));
        }

        // ── PUT /api/tours/{id}
        //Cập nhật tour — chỉ Admin
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<TourDetailDto>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> Update(int id, [FromBody] TourRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<string>.Fail("Dữ liệu không hợp lệ."));

            var updated = await svc.UpdateTourAsync(id, dto);
            return Ok(ApiResponse<TourDetailDto>.Ok(updated, "Cập nhật tour thành công."));
        }

        // ── DELETE /api/tours/{id}
        //Xóa tour (soft-delete: IsActive = false) — chỉ Admin
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<string>), 200)]
        [ProducesResponseType(typeof(ApiResponse<string>), 404)]
        public async Task<IActionResult> Delete(int id)
        {
            await svc.DeleteTourAsync(id);
            return Ok(ApiResponse<string>.Ok("deleted", "Xóa tour thành công."));
        }
    }
}
