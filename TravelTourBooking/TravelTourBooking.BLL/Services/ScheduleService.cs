using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services
{
    public class ScheduleService(IScheduleRepository repo, ITourRepository tourRepo, IMapper mapper) : IScheduleService
    {
        public async Task<IEnumerable<ScheduleResponseDto>> GetAllAsync()
        {
            var all = await repo.GetAllAsync();
            return mapper.Map<IEnumerable<ScheduleResponseDto>>(all);
        }

        public async Task<IEnumerable<ScheduleResponseDto>> GetByTourAsync(int tourId)
        {
            var schedules = await repo.GetByTourAsync(tourId);
            return mapper.Map<IEnumerable<ScheduleResponseDto>>(schedules);
        }

        public async Task<ScheduleResponseDto?> GetByIdAsync(int scheduleId)
        {
            var s = await repo.GetByIdAsync(scheduleId);
            return s is null ? null : mapper.Map<ScheduleResponseDto>(s);
        }

        public async Task<ScheduleResponseDto> CreateAsync(ScheduleRequestDto dto)
        {
            if (!await tourRepo.ExistsAsync(dto.TourId))
                throw new KeyNotFoundException($"Tour ID {dto.TourId} không tồn tại.");

            var entity = mapper.Map<TourSchedule>(dto);
            entity.Status = "Open";
            // AvailableSlots set from dto.AvailableSlots (initial capacity)

            var created = await repo.AddAsync(entity);
            var full = await repo.GetByIdAsync(created.ScheduleId);
            return mapper.Map<ScheduleResponseDto>(full!);
        }

        public async Task<ScheduleResponseDto> UpdateAsync(int scheduleId, ScheduleRequestDto dto)
        {
            var existing = await repo.GetByIdAsync(scheduleId)
                ?? throw new KeyNotFoundException($"Lịch ID {scheduleId} không tồn tại.");

            existing.DepartureDate = dto.DepartureDate;
            existing.ReturnDate = dto.ReturnDate;
            existing.AvailableSlots = dto.AvailableSlots;
            existing.EmployeeId = dto.EmployeeId;

            await repo.UpdateAsync(existing);
            var full = await repo.GetByIdAsync(scheduleId);
            return mapper.Map<ScheduleResponseDto>(full!);
        }

        public async Task DeleteAsync(int scheduleId)
        {
            if (!await repo.ExistsAsync(scheduleId))
                throw new KeyNotFoundException($"Lịch ID {scheduleId} không tồn tại.");
            await repo.DeleteAsync(scheduleId);
        }
    }
}
