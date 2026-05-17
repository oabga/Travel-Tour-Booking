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
    public class CategoryService(ICategoryRepository repo, IMapper mapper) : ICategoryService
    {
        public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync()
        {
            var all = await repo.GetAllAsync();
            return mapper.Map<IEnumerable<CategoryResponseDto>>(all);
        }

        public async Task<CategoryResponseDto?> GetByIdAsync(int id)
        {
            var c = await repo.GetByIdAsync(id);
            return c is null ? null : mapper.Map<CategoryResponseDto>(c);
        }

        public async Task<CategoryResponseDto> CreateAsync(CategoryRequestDto dto)
        {
            // LINQ to Objects check via repo
            if (await repo.NameExistsAsync(dto.CateName))
                throw new InvalidOperationException($"Danh mục '{dto.CateName}' đã tồn tại.");

            var entity = mapper.Map<Category>(dto);
            var created = await repo.AddAsync(entity);
            return mapper.Map<CategoryResponseDto>(created);
        }

        public async Task<CategoryResponseDto> UpdateAsync(int id, CategoryRequestDto dto)
        {
            var existing = await repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Danh mục ID {id} không tồn tại.");

            if (await repo.NameExistsAsync(dto.CateName, excludeId: id))
                throw new InvalidOperationException($"Danh mục '{dto.CateName}' đã tồn tại.");

            mapper.Map(dto, existing);
            await repo.UpdateAsync(existing);
            return mapper.Map<CategoryResponseDto>(existing);
        }

        public async Task DeleteAsync(int id)
        {
            if (!await repo.ExistsAsync(id))
                throw new KeyNotFoundException($"Danh mục ID {id} không tồn tại.");

            if (await repo.HasToursAsync(id))
                throw new InvalidOperationException("Không thể xóa danh mục này vì đang có các tour thuộc danh mục này.");

            await repo.DeleteAsync(id);
        }
    }
}
