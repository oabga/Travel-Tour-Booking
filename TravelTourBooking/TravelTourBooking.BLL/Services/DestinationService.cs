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
    public class DestinationService(IDestinationRepository repo, IMapper mapper) : IDestinationService
    {
        public async Task<IEnumerable<DestinationResponseDto>> GetAllAsync()
        {
            var all = await repo.GetAllAsync();
            return mapper.Map<IEnumerable<DestinationResponseDto>>(all);
        }

        public async Task<DestinationResponseDto?> GetByIdAsync(int id)
        {
            var d = await repo.GetByIdAsync(id);
            return d is null ? null : mapper.Map<DestinationResponseDto>(d);
        }

        public async Task<DestinationResponseDto> CreateAsync(DestinationRequestDto dto)
        {
            if (await repo.NameExistsAsync(dto.DesName))
                throw new InvalidOperationException($"Điểm đến '{dto.DesName}' đã tồn tại.");

            var entity = mapper.Map<Destination>(dto);
            var created = await repo.AddAsync(entity);
            return mapper.Map<DestinationResponseDto>(created);
        }

        public async Task<DestinationResponseDto> UpdateAsync(int id, DestinationRequestDto dto)
        {
            var existing = await repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Điểm đến ID {id} không tồn tại.");

            if (await repo.NameExistsAsync(dto.DesName, excludeId: id))
                throw new InvalidOperationException($"Điểm đến '{dto.DesName}' đã tồn tại.");

            mapper.Map(dto, existing);
            await repo.UpdateAsync(existing);
            return mapper.Map<DestinationResponseDto>(existing);
        }

        public async Task DeleteAsync(int id)
        {
            if (!await repo.ExistsAsync(id))
                throw new KeyNotFoundException($"Điểm đến ID {id} không tồn tại.");
            await repo.DeleteAsync(id);
        }
    }
}
