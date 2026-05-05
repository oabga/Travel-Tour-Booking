using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryResponseDto>> GetAllAsync();
        Task<CategoryResponseDto?> GetByIdAsync(int id);
        Task<CategoryResponseDto> CreateAsync(CategoryRequestDto dto);
        Task<CategoryResponseDto> UpdateAsync(int id, CategoryRequestDto dto);
        Task DeleteAsync(int id);
    }
}
