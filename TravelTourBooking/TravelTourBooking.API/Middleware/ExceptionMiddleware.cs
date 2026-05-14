using System.Net;
using System.Text.Json;
using TravelTourBooking.Common.DTOs;

namespace TravelTourBooking.API.Middleware
{
    public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext ctx)
        {
            try
            {
                await next(ctx);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
                await HandleExceptionAsync(ctx, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext ctx, Exception ex)
        {
            ctx.Response.ContentType = "application/json";

            ctx.Response.StatusCode = ex switch
            {
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedAccessException => (int)HttpStatusCode.Forbidden,
                InvalidOperationException => (int)HttpStatusCode.Conflict,
                ArgumentException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            var body = JsonSerializer.Serialize(
             ApiResponse<string>.Fail(
                 ex.InnerException?.Message ?? ex.Message),
             new JsonSerializerOptions
             {
                 PropertyNamingPolicy = JsonNamingPolicy.CamelCase
             });

            return ctx.Response.WriteAsync(body);
        }
    }
}
