using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.DAL.Repositories.Interfaces
{
    public interface IDestinationRepository : IRepository<Destination>
    {
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        Task<bool> HasToursAsync(int destinationId);
    }
}
