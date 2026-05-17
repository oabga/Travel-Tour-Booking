using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/roles")]
public class RolesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RolesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        // 1. Lấy từ bảng Roles
        var rolesFromDb = await _context.Roles
            .Select(r => r.RoleName)
            .ToListAsync();
            
        // 2. Lấy thêm các vai trò thực tế đang có ở bảng Employees (để tránh mất dữ liệu cũ)
        var rolesFromEmployees = await _context.Employees
            .Where(e => !string.IsNullOrEmpty(e.Role))
            .Select(e => e.Role!)
            .Distinct()
            .ToListAsync();

        // 3. Các vai trò mặc định cần phải có
        var defaultRoles = new List<string> { "Admin", "Staff", "Manager", "Guide" };

        // Hợp nhất và loại bỏ trùng lặp
        var finalRoles = rolesFromDb
            .Concat(rolesFromEmployees)
            .Concat(defaultRoles)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select((name, index) => new { RoleId = index + 1, RoleName = name })
            .ToList();

        return Ok(ApiResponse<object>.Ok(finalRoles));
    }
}
