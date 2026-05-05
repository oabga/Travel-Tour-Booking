using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Interfaces
{
    public interface IScheduleService
    {
        Task<IEnumerable<ScheduleResponseDto>> GetAllAsync();
        Task<IEnumerable<ScheduleResponseDto>> GetByTourAsync(int tourId);
        Task<ScheduleResponseDto?> GetByIdAsync(int scheduleId);
        Task<ScheduleResponseDto> CreateAsync(ScheduleRequestDto dto);
        Task<ScheduleResponseDto> UpdateAsync(int scheduleId, ScheduleRequestDto dto);
        Task DeleteAsync(int scheduleId);
    }
}
