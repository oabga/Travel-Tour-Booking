using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.Common.DTOs;
using FluentValidation;

namespace TravelTourBooking.BLL.Validators
{
    public class TourValidator : AbstractValidator<TourRequestDto>
    {
        public TourValidator()
        {
            RuleFor(x => x.TourName)
                .NotEmpty().WithMessage("Tên tour không được để trống.")
                .MaximumLength(150).WithMessage("Tên tour tối đa 150 ký tự.");

            RuleFor(x => x.CateId)
                .GreaterThan(0).WithMessage("Vui lòng chọn danh mục.");

            RuleFor(x => x.DesId)
                .GreaterThan(0).WithMessage("Vui lòng chọn điểm đến.");

            RuleFor(x => x.DurationDays)
                .InclusiveBetween(1, 30).WithMessage("Số ngày phải từ 1 đến 30.");

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Giá tour phải lớn hơn 0.");

            RuleFor(x => x.MaxCapacity)
                .InclusiveBetween(1, 500).WithMessage("Sức chứa phải từ 1 đến 500.");

            RuleFor(x => x.ImageUrl)
                .MaximumLength(255).WithMessage("URL ảnh tối đa 255 ký tự.")
                .When(x => x.ImageUrl is not null);
        }
    }
}
