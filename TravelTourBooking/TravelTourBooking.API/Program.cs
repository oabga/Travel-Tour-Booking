using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using TravelTourBooking.API.Middleware;
using TravelTourBooking.BLL.Helpers;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.BLL.Services;
using TravelTourBooking.BLL.Validators;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;
using TravelTourBooking.DAL.Repositories;
using TravelTourBooking.DAL.Repositories.Interfaces;

var builder = WebApplication.CreateBuilder(args);
var cfg = builder.Configuration;

// ── Database ──────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(cfg.GetConnectionString("DefaultConnection")));

// ── ADO.NET ───────────────────────────────────────────────────────────────
builder.Services.AddSingleton(_ =>
    new AdoTourRepository(cfg.GetConnectionString("DefaultConnection")!));

// ── Repositories (DAL) ────────────────────────────────────────────────────
builder.Services.AddScoped<ITourRepository, TourRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IDestinationRepository, DestinationRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

// ── Services (BLL) ────────────────────────────────────────────────────────
builder.Services.AddScoped<ITourService, TourService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDestinationService, DestinationService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped< IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IReviewService,ReviewService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<IPaymentService, PaymentService>();


// ── AutoMapper ────────────────────────────────────────────────────────────
builder.Services.AddAutoMapper(typeof(MappingProfile));

// ── FluentValidation ──────────────────────────────────────────────────────
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<TourValidator>();

// ── JWT Authentication ────────────────────────────────────────────────────
var jwtSection = cfg.GetSection("JwtSettings");
var secretKey = jwtSection["SecretKey"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    var key = Encoding.UTF8.GetBytes( builder.Configuration["JwtSettings:SecretKey"]!);
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer =builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
});

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowAngular", p =>
        p.WithOrigins("http://localhost:4200")
         .AllowAnyHeader()
         .AllowAnyMethod()));

// ── Controllers + Swagger ─────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(s =>
{
    s.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TravelTourBooking API — Catalog + Booking + Auth-customer (TV1 + TV2 + TV3)",
        Version = "v1"
    });

    // JWT support in Swagger UI
    s.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token: Bearer {token}"
    });
    s.AddSecurityRequirement(new OpenApiSecurityRequirement
    {{
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id   = "Bearer"
            }
        },
        Array.Empty<string>()
    }});
});

// ─────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>();   // Global error handler

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TravelTourBooking API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Kiểm tra xem Role Admin đã có trong bảng Roles chưa
    var adminRole = db.Roles.FirstOrDefault(r => r.RoleName == "Admin");
    if (adminRole == null)
    {
        adminRole = new Role { RoleName = "Admin" };
        db.Roles.Add(adminRole);
        db.SaveChanges();
    }
    // Kiểm tra xem đã có tài khoản nào được gán quyền Admin chưa
    if (!db.Accounts.Any(a => a.Email == "admin@traveltour.com"))
    {
        var hash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var admin = new Account
        {
            Email = "admin@traveltour.com",
            PasswordHash = hash,
            CreatedAt = DateTime.UtcNow
        };
        db.Accounts.Add(admin);
        db.SaveChanges();
        db.AccountRoles.Add(new AccountRole { AccountId = admin.AccountId, RoleId = adminRole.RoleId });
        db.Employees.Add(new Employee { FullName = "System Admin", Email = admin.Email, Phone = "0000000000", Role = "Admin" });
        db.SaveChanges();
    }
}

app.Run();
