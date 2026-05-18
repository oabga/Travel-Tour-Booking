using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TravelTourBooking.API.Controllers;

[ApiController]
[Route("api/vouchers")]
public class VouchersController(AppDbContext dbContext) : ControllerBase
{
    // Validate voucher
    [HttpGet("validate/{code}")]
    [Authorize]
    public async Task<IActionResult> Validate(string code)
    {
        code = code.ToUpper().Trim();
        var voucher = await dbContext.Vouchers
            .FirstOrDefaultAsync(v => v.Code == code);

        if (voucher == null)
        {
            return Ok(ApiResponse<VoucherValidationDto>.Fail("Mã giảm giá không tồn tại trong hệ thống."));
        }

        var now = DateTime.Now;
        if (now < voucher.StartDate || now > voucher.EndDate)
        {
            return Ok(ApiResponse<VoucherValidationDto>.Fail("Mã giảm giá đã hết hạn hoặc chưa đến ngày có hiệu lực."));
        }

        if (voucher.UsedCount >= voucher.MaxUsage)
        {
            return Ok(ApiResponse<VoucherValidationDto>.Fail("Mã giảm giá đã đạt tối đa số lượt sử dụng."));
        }

        return Ok(ApiResponse<VoucherValidationDto>.Ok(new VoucherValidationDto
        {
            Code = voucher.Code,
            DiscountPercent = voucher.DiscountPercent,
            IsValid = true,
            Message = $"Áp dụng mã {voucher.Code} thành công! Bạn được giảm {voucher.DiscountPercent:0.#}%."
        }));
    }

    // CRUD - GET all (Admin only)
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var list = await dbContext.Vouchers
            .OrderByDescending(v => v.VoucherId)
            .Select(v => new VoucherDto
            {
                VoucherId = v.VoucherId,
                Code = v.Code,
                DiscountPercent = v.DiscountPercent,
                StartDate = v.StartDate,
                EndDate = v.EndDate,
                MaxUsage = v.MaxUsage,
                UsedCount = v.UsedCount
            })
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<VoucherDto>>.Ok(list));
    }

    // CRUD - GET by id (Admin only)
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var v = await dbContext.Vouchers.FindAsync(id);
        if (v == null)
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy voucher."));

        var dto = new VoucherDto
        {
            VoucherId = v.VoucherId,
            Code = v.Code,
            DiscountPercent = v.DiscountPercent,
            StartDate = v.StartDate,
            EndDate = v.EndDate,
            MaxUsage = v.MaxUsage,
            UsedCount = v.UsedCount
        };

        return Ok(ApiResponse<VoucherDto>.Ok(dto));
    }

    // CRUD - CREATE (Admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(VoucherCreateUpdateDto dto)
    {
        var codeUpper = dto.Code.Trim().ToUpper();
        if (await dbContext.Vouchers.AnyAsync(v => v.Code == codeUpper))
        {
            return BadRequest(ApiResponse<string>.Fail("Mã giảm giá này đã tồn tại trong hệ thống."));
        }

        if (dto.StartDate >= dto.EndDate)
        {
            return BadRequest(ApiResponse<string>.Fail("Ngày kết thúc phải lớn hơn ngày bắt đầu."));
        }

        var voucher = new Voucher
        {
            Code = codeUpper,
            DiscountPercent = dto.DiscountPercent,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            MaxUsage = dto.MaxUsage,
            UsedCount = 0
        };

        dbContext.Vouchers.Add(voucher);
        await dbContext.SaveChangesAsync();

        var resDto = new VoucherDto
        {
            VoucherId = voucher.VoucherId,
            Code = voucher.Code,
            DiscountPercent = voucher.DiscountPercent,
            StartDate = voucher.StartDate,
            EndDate = voucher.EndDate,
            MaxUsage = voucher.MaxUsage,
            UsedCount = voucher.UsedCount
        };

        return CreatedAtAction(nameof(GetById), new { id = voucher.VoucherId }, ApiResponse<VoucherDto>.Ok(resDto, "Tạo mã giảm giá thành công."));
    }

    // CRUD - UPDATE (Admin only)
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, VoucherCreateUpdateDto dto)
    {
        var voucher = await dbContext.Vouchers.FindAsync(id);
        if (voucher == null)
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy voucher."));

        var codeUpper = dto.Code.Trim().ToUpper();
        if (await dbContext.Vouchers.AnyAsync(v => v.Code == codeUpper && v.VoucherId != id))
        {
            return BadRequest(ApiResponse<string>.Fail("Mã giảm giá này đã tồn tại trong hệ thống."));
        }

        if (dto.StartDate >= dto.EndDate)
        {
            return BadRequest(ApiResponse<string>.Fail("Ngày kết thúc phải lớn hơn ngày bắt đầu."));
        }

        voucher.Code = codeUpper;
        voucher.DiscountPercent = dto.DiscountPercent;
        voucher.StartDate = dto.StartDate;
        voucher.EndDate = dto.EndDate;
        voucher.MaxUsage = dto.MaxUsage;

        dbContext.Vouchers.Update(voucher);
        await dbContext.SaveChangesAsync();

        var resDto = new VoucherDto
        {
            VoucherId = voucher.VoucherId,
            Code = voucher.Code,
            DiscountPercent = voucher.DiscountPercent,
            StartDate = voucher.StartDate,
            EndDate = voucher.EndDate,
            MaxUsage = voucher.MaxUsage,
            UsedCount = voucher.UsedCount
        };

        return Ok(ApiResponse<VoucherDto>.Ok(resDto, "Cập nhật mã giảm giá thành công."));
    }

    // CRUD - DELETE (Admin only)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var voucher = await dbContext.Vouchers.FindAsync(id);
        if (voucher == null)
            return NotFound(ApiResponse<string>.Fail("Không tìm thấy voucher."));

        dbContext.Vouchers.Remove(voucher);
        await dbContext.SaveChangesAsync();

        return Ok(ApiResponse<string>.Ok("Xóa mã giảm giá thành công."));
    }
}
