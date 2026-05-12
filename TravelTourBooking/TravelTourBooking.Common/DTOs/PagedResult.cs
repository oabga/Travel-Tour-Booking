using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TravelTourBooking.Common.DTOs
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Items { get; set; } = [];
        public PaginationMeta Pagination { get; set; } = new();
    }
}
