using FluentValidation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.BLL.Validators
{
    public class ScheduleValidator : AbstractValidator<ScheduleRequestDto>
    {
        public ScheduleValidator()
        {
            RuleFor(x => x.TourId).GreaterThan(0);

            RuleFor(x => x.DepartureDate)
                .Must(d => d >= DateOnly.FromDateTime(DateTime.Today))
                .WithMessage("Ngày khởi hành phải từ hôm nay trở đi.");

            RuleFor(x => x.ReturnDate)
                .Must((dto, ret) => ret > dto.DepartureDate)
                .WithMessage("Ngày về phải sau ngày khởi hành.");

            RuleFor(x => x.AvailableSlots)
                .InclusiveBetween(1, 500).WithMessage("Số chỗ phải từ 1 đến 500.");
        }
    }
}
