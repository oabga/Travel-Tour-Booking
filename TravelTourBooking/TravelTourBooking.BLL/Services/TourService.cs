using AutoMapper;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories.Interfaces;

namespace TravelTourBooking.BLL.Services
{
    public class TourService(
    ITourRepository tourRepo,
    ICategoryRepository cateRepo,
    IDestinationRepository desRepo,
    IMapper mapper) : ITourService
    {
        // ── GET paged list (LINQ to Entities inside repo) ─────────────────────
        public async Task<PagedResult<TourListDto>> GetToursAsync(
            int page, int pageSize,
            int? cateId, int? desId, int? durationDays,
            decimal? priceMin, decimal? priceMax)
        {
            var (items, total) = await tourRepo.GetPagedAsync(
                page, pageSize, cateId, desId, durationDays, priceMin, priceMax);

            // LINQ to Objects — map + compute AvgRating
            var dtos = items.Select(t => new TourListDto
            {
                TourId = t.TourId,
                TourName = t.TourName,
                Price = t.Price,
                DurationDays = t.DurationDays,
                MaxCapacity = t.MaxCapacity,
                ImageUrl = t.ImageUrl,
                CateName = t.Category?.CateName,
                DesName = t.Destination?.DesName,
                AvgRating = t.Reviews.Any()
                               ? Math.Round(t.Reviews.Average(r => (decimal)r.Rating), 1)
                               : (decimal?)null
            }).ToList();   // LINQ to Objects materialise

            return new PagedResult<TourListDto>
            {
                Items = dtos,
                Pagination = new PaginationMeta
                {
                    Page = page,
                    PageSize = pageSize,
                    TotalCount = total
                }
            };
        }

        // ── GET detail ────────
        public async Task<TourDetailDto?> GetTourDetailAsync(int tourId)
        {
            var tour = await tourRepo.GetDetailAsync(tourId);
            if (tour is null) return null;
            return mapper.Map<TourDetailDto>(tour);
        }

        // ── SEARCH via sp_SearchTours (ADO.NET inside repo) ──────
        public Task<IEnumerable<SearchTourResult>> SearchToursAsync(
            string? destination, decimal? priceMin, decimal? priceMax, DateOnly? date)
            => tourRepo.SearchAsync(destination, priceMin, priceMax, date);

        // ── Popular tours (vw_PopularTours) ──────
        public Task<IEnumerable<PopularTourResult>> GetPopularToursAsync()
            => tourRepo.GetPopularAsync();

        public Task<IReadOnlyList<int>> GetDurationOptionsAsync()
            => tourRepo.GetDistinctDurationDaysAsync();

        // ── CREATE ───────────
        public async Task<TourDetailDto> CreateTourAsync(TourRequestDto dto)
        {
            // Business rules (LINQ to Objects)
            if (!await cateRepo.ExistsAsync(dto.CateId))
                throw new KeyNotFoundException($"Danh mục ID {dto.CateId} không tồn tại.");
            if (!await desRepo.ExistsAsync(dto.DesId))
                throw new KeyNotFoundException($"Điểm đến ID {dto.DesId} không tồn tại.");

            var tour = mapper.Map<Tour>(dto);
            tour.IsActive = true;

            var created = await tourRepo.AddAsync(tour);
            var detail = await tourRepo.GetDetailAsync(created.TourId);
            return mapper.Map<TourDetailDto>(detail!);
        }

        // ── UPDATE ──────────
        public async Task<TourDetailDto> UpdateTourAsync(int tourId, TourRequestDto dto)
        {
            var existing = await tourRepo.GetByIdAsync(tourId)
                ?? throw new KeyNotFoundException($"Tour ID {tourId} không tồn tại.");

            if (!await cateRepo.ExistsAsync(dto.CateId))
                throw new KeyNotFoundException($"Danh mục ID {dto.CateId} không tồn tại.");
            if (!await desRepo.ExistsAsync(dto.DesId))
                throw new KeyNotFoundException($"Điểm đến ID {dto.DesId} không tồn tại.");

            mapper.Map(dto, existing);   // overwrite existing with dto values
            await tourRepo.UpdateAsync(existing);

            var detail = await tourRepo.GetDetailAsync(tourId);
            return mapper.Map<TourDetailDto>(detail!);
        }

        public async Task DeleteTourAsync(int tourId)
        {
            var tour = await tourRepo.GetByIdAsync(tourId)
                ?? throw new KeyNotFoundException($"Tour ID {tourId} không tồn tại.");

            tour.IsActive = false;
            await tourRepo.UpdateAsync(tour);
        }

        public async Task<string> ExportToursToXmlAsync()
        {
            var tours = (await tourRepo.GetAllAsync())
                .Select(t => new TourXmlDto
                {
                    TourName = t.TourName ?? string.Empty,
                    CateId = t.CateId ?? 0,
                    DesId = t.DesId ?? 0,
                    DurationDays = t.DurationDays,
                    Price = t.Price,
                    MaxCapacity = t.MaxCapacity,
                    Description = t.Description,
                    ImageUrl = t.ImageUrl
                }).ToList();
            var serializer = new XmlSerializer(typeof(List<TourXmlDto>));
            using var writer = new StringWriter();
            serializer.Serialize(writer, tours);
            return writer.ToString();
        }
        public async Task<int> ImportToursFromXmlAsync(Stream xmlStream)
        {
            var serializer = new XmlSerializer(typeof(List<TourXmlDto>));
            var tours = (List<TourXmlDto>)serializer.Deserialize(xmlStream)!;

            int count = 0;
            foreach (var dto in tours)
            {
                var tour = new Tour
                {
                    TourName = dto.TourName,
                    CateId = dto.CateId,
                    DesId = dto.DesId,
                    DurationDays = dto.DurationDays,
                    Price = dto.Price,
                    MaxCapacity = dto.MaxCapacity,
                    Description = dto.Description,
                    ImageUrl = dto.ImageUrl,
                    IsActive = true
                };
                await tourRepo.AddAsync(tour);
                count++;
            }
            return count;
        }
    }
}
