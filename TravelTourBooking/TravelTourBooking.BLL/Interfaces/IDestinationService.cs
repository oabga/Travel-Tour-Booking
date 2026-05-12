using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface IDestinationService
    {
        Task<IEnumerable<DestinationResponseDto>> GetAllAsync();
        Task<DestinationResponseDto?> GetByIdAsync(int id);
        Task<DestinationResponseDto> CreateAsync(DestinationRequestDto dto);
        Task<DestinationResponseDto> UpdateAsync(int id, DestinationRequestDto dto);
        Task DeleteAsync(int id);
    }
}
