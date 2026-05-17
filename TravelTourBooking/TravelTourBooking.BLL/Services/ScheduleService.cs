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
            var tour = await tourRepo.GetByIdAsync(dto.TourId)
                ?? throw new KeyNotFoundException($"Tour ID {dto.TourId} không tồn tại.");

            var expectedReturnDate = dto.DepartureDate.AddDays(tour.DurationDays - 1);
            if (dto.ReturnDate != expectedReturnDate)
            {
                throw new ArgumentException($"Ngày về không khớp với số ngày của tour ({tour.DurationDays} ngày). " +
                    $"Với ngày đi là {dto.DepartureDate:dd/MM/yyyy}, ngày về phải là {expectedReturnDate:dd/MM/yyyy}.");
            }

            if (dto.AvailableSlots > tour.MaxCapacity)
            {
                throw new ArgumentException($"Số chỗ của lịch khởi hành ({dto.AvailableSlots}) không được lớn hơn sức chứa tối đa của tour ({tour.MaxCapacity}).");
            }

            var entity = mapper.Map<TourSchedule>(dto);
            entity.Status = "Open";
            entity.AvailableSlots = dto.AvailableSlots;

            var created = await repo.AddAsync(entity);
            var full = await repo.GetByIdAsync(created.ScheduleId);
            return mapper.Map<ScheduleResponseDto>(full!);
        }

        public async Task<ScheduleResponseDto> UpdateAsync(int scheduleId, ScheduleRequestDto dto)
        {
            var existing = await repo.GetByIdAsync(scheduleId)
                ?? throw new KeyNotFoundException($"Lịch ID {scheduleId} không tồn tại.");

            var tour = await tourRepo.GetByIdAsync(dto.TourId)
                ?? throw new KeyNotFoundException($"Tour ID {dto.TourId} không tồn tại.");

            var expectedReturnDate = dto.DepartureDate.AddDays(tour.DurationDays - 1);
            if (dto.ReturnDate != expectedReturnDate)
            {
                throw new ArgumentException($"Ngày về không khớp với số ngày của tour ({tour.DurationDays} ngày). " +
                    $"Với ngày đi là {dto.DepartureDate:dd/MM/yyyy}, ngày về phải là {expectedReturnDate:dd/MM/yyyy}.");
            }

            if (dto.AvailableSlots > tour.MaxCapacity)
            {
                throw new ArgumentException($"Số chỗ của lịch khởi hành ({dto.AvailableSlots}) không được lớn hơn sức chứa tối đa của tour ({tour.MaxCapacity}).");
            }

            if (await repo.HasBookingsAsync(scheduleId))
            {
                if (existing.DepartureDate != dto.DepartureDate || 
                    existing.ReturnDate != dto.ReturnDate || 
                    existing.AvailableSlots != dto.AvailableSlots)
                {
                    throw new InvalidOperationException("Không thể cập nhật ngày đi, ngày về hoặc số chỗ của lịch trình này vì đã có khách hàng đặt chỗ. Bạn chỉ được phép thay đổi Hướng dẫn viên.");
                }
            }

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

            if (await repo.HasBookingsAsync(scheduleId))
                throw new InvalidOperationException("Không thể xóa lịch trình này vì đã có khách hàng đặt chỗ (booking).");

            await repo.DeleteAsync(scheduleId);
        }
    }
}
