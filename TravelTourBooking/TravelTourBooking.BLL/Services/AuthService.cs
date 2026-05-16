using Microsoft.EntityFrameworkCore;
using TravelTourBooking.BLL.Helpers;
using TravelTourBooking.BLL.Interfaces;
using TravelTourBooking.Common.DTOs.Auth;
using TravelTourBooking.DAL.EFCore;
using TravelTourBooking.DAL.EFCore.Entities;

namespace TravelTourBooking.BLL.Services
{

    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;

        private readonly JwtHelper _jwtHelper;

        public AuthService(
            AppDbContext context,
            JwtHelper jwtHelper)
        {
            _context = context;
            _jwtHelper = jwtHelper;
        }

        public async Task<AuthResponseDto> RegisterAsync(
            RegisterDto dto)
        {
            var exists = await _context.Accounts
                .AnyAsync(x => x.Email == dto.Email);

            if (exists)
            {
                throw new Exception("Email already exists");
            }

            var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var account = new Account
            {
                Email = dto.Email,
                PasswordHash = hash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Accounts.Add(account);

            await _context.SaveChangesAsync();

            var customerRole = await _context.Roles
                .FirstAsync(x => x.RoleName == "Customer");

            _context.AccountRoles.Add(new AccountRole
            {
                AccountId = account.AccountId,
                RoleId = customerRole.RoleId
            });

            _context.CustomerProfiles.Add(
                new CustomerProfile
                {
                    AccountId = account.AccountId,
                    FullName = dto.FullName,
                    Phone = dto.Phone,
                    DateOfBirth = dto.DateOfBirth,
                    Address = dto.Address
                });

            await _context.SaveChangesAsync();

            var roles = new List<string> { "Customer" };

            var token =
                _jwtHelper.GenerateToken(account, roles);

            return new AuthResponseDto
            {
                Token = token,
                Email = account.Email,
                Role = "Customer"
            };
        }

        public async Task<AuthResponseDto> LoginAsync(
            LoginDto dto)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(x =>
                    x.Email == dto.Email);

            if (account == null)
            {
                throw new Exception("Invalid email");
            }

            var valid = BCrypt.Net.BCrypt.Verify(
                dto.Password,
                account.PasswordHash);

            if (!valid)
            {
                throw new Exception("Invalid password");
            }

            var roles = await _context.AccountRoles
                .Where(x => x.AccountId == account.AccountId)
                .Select(x => x.Role.RoleName)
                .ToListAsync();

            var token =
                _jwtHelper.GenerateToken(account, roles);

            var roleName = roles.FirstOrDefault()!;

            bool requireChange = (roleName == "Admin" && dto.Password == "Admin@123");
            return new AuthResponseDto
            {
                Token = token,
                Email = account.Email,
                Role = roleName,
                RequirePasswordChange = requireChange
            };
        }

        public async Task<AuthResponseDto> CreateStaffAsync(CreateStaffDto dto)
        {
            // Kiểm tra xem email đã tồn tại chưa
            var exists = await _context.Accounts.AnyAsync(x => x.Email == dto.Email);
            if (exists)
            {
                throw new Exception("Email already exists");
            }
            var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            // 1. Tạo Account mới
            var account = new Account
            {
                Email = dto.Email,
                PasswordHash = hash,
                CreatedAt = DateTime.UtcNow
            };
            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            // 2. Gán Role (Tìm role hoặc tạo mới nếu chưa có)
            var role = await _context.Roles.FirstOrDefaultAsync(x => x.RoleName == dto.Role);
            if (role == null)
            {
                role = new Role { RoleName = dto.Role };
                _context.Roles.Add(role);
                await _context.SaveChangesAsync();
            }
            _context.AccountRoles.Add(new AccountRole
            {
                AccountId = account.AccountId,
                RoleId = role.RoleId
            });
            // 3. Tạo thông tin Employee tương ứng
            var emp = new Employee
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                Role = dto.Role
            };
            _context.Employees.Add(emp);
            await _context.SaveChangesAsync();
            return new AuthResponseDto
            {
                Token = "", // Không cần trả về token vì Admin đang thao tác
                Email = account.Email,
                Role = dto.Role
            };
        }

        public async Task<bool> ChangePasswordAsync(int accountId, ChangePasswordDto dto)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null) throw new Exception("Tài khoản không tồn tại");
            // Kiểm tra mật khẩu cũ
            var valid = BCrypt.Net.BCrypt.Verify(dto.OldPassword, account.PasswordHash);
            if (!valid) throw new Exception("Mật khẩu cũ không chính xác");
            // Mã hoá và lưu mật khẩu mới
            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}