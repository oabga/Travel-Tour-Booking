using AutoMapper;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Helpers;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Category, CategoryResponseDto>();
        CreateMap<CategoryRequestDto, Category>()
            .ForMember(d => d.CateId, o => o.Ignore());

        CreateMap<Destination, DestinationResponseDto>();
        CreateMap<DestinationRequestDto, Destination>()
            .ForMember(d => d.DesId, o => o.Ignore());

        CreateMap<Employee, EmployeeDto>();

        CreateMap<TourSchedule, ScheduleResponseDto>()
            .ForMember(d => d.EmployeeName, o => o.MapFrom(s =>
                s.Employee != null ? s.Employee.FullName : null));
        CreateMap<ScheduleRequestDto, TourSchedule>()
            .ForMember(d => d.ScheduleId, o => o.Ignore())
            .ForMember(d => d.Status, o => o.Ignore())
            .ForMember(d => d.AvailableSlots, o => o.Ignore());

        CreateMap<Tour, TourListDto>()
            .ForMember(d => d.CateName, o => o.MapFrom(t => t.Category != null ? t.Category.CateName : null))
            .ForMember(d => d.DesName, o => o.MapFrom(t => t.Destination != null ? t.Destination.DesName : null))
            .ForMember(d => d.AvgRating, o => o.MapFrom(t =>
                t.Reviews.Any()
                    ? Math.Round(t.Reviews.Average(r => (double)r.Rating), 1)
                    : (double?)null));

        CreateMap<Tour, TourDetailDto>()
            .ForMember(d => d.CateName, o => o.MapFrom(t => t.Category != null ? t.Category.CateName : null))
            .ForMember(d => d.DesName, o => o.MapFrom(t => t.Destination != null ? t.Destination.DesName : null))
            .ForMember(d => d.Country, o => o.MapFrom(t => t.Destination != null ? t.Destination.Country : null))
            .ForMember(d => d.City, o => o.MapFrom(t => t.Destination != null ? t.Destination.City : null))
            .ForMember(d => d.AvgRating, o => o.MapFrom(t =>
                t.Reviews.Any()
                    ? Math.Round(t.Reviews.Average(r => (double)r.Rating), 1)
                    : (double?)null))
            .ForMember(d => d.TotalReviews, o => o.MapFrom(t => t.Reviews.Count))
            .ForMember(d => d.Schedules, o => o.MapFrom(t => t.TourSchedules));

        CreateMap<TourRequestDto, Tour>()
            .ForMember(d => d.TourId, o => o.Ignore())
            .ForMember(d => d.IsActive, o => o.Ignore());
    }
}