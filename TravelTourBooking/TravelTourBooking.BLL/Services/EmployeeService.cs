using Microsoft.EntityFrameworkCore;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.BLL.Services;

public class EmployeeService : IEmployeeService
{
    private readonly AppDbContext _context;

    public EmployeeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EmployeeDto>>
        GetAllAsync()
    {
        return await _context.Employees
            .Select(x => new EmployeeDto
            {
                EmployeeId = x.EmployeeId,
                FullName = x.FullName,
                Role = x.Role,
                Phone = x.Phone,
                Email = x.Email
            })
            .ToListAsync();
    }

    public async Task<EmployeeDto>
        CreateAsync(EmployeeDto dto)
    {
        var emp = new Employee
        {
            FullName = dto.FullName,
            Role = dto.Role,
            Phone = dto.Phone,
            Email = dto.Email
        };

        _context.Employees.Add(emp);

        await _context.SaveChangesAsync();

        dto.EmployeeId = emp.EmployeeId;

        return dto;
    }

    public async Task<EmployeeDto>
        UpdateAsync(
            int id,
            EmployeeDto dto)
    {
        var emp = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.EmployeeId == id);

        if (emp == null)
        {
            throw new Exception(
                "Employee not found");
        }

        emp.FullName = dto.FullName;
        emp.Role = dto.Role;
        emp.Phone = dto.Phone;
        emp.Email = dto.Email;

        await _context.SaveChangesAsync();

        return new EmployeeDto
        {
            EmployeeId = emp.EmployeeId,
            FullName = emp.FullName,
            Role = emp.Role,
            Phone = emp.Phone,
            Email = emp.Email
        };
    }

    public async Task DeleteAsync(int id)
    {
        var emp = await _context.Employees
            .FirstOrDefaultAsync(x =>
                x.EmployeeId == id);

        if (emp == null)
        {
            throw new Exception(
                "Employee not found");
        }

        _context.Employees.Remove(emp);

        await _context.SaveChangesAsync();
    }
}