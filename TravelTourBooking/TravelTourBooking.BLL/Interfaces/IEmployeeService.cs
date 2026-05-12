using TravelTourBooking.Common.DTOs;
namespace TravelTourBooking.BLL.Interfaces;
public interface IEmployeeService
{
    Task<IEnumerable<EmployeeDto>> GetAllAsync();
    Task<EmployeeDto> CreateAsync(EmployeeDto dto);
    Task<EmployeeDto> UpdateAsync(
        int id,
        EmployeeDto dto);

    Task DeleteAsync(int id);
}