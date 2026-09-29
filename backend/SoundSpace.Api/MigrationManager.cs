using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Data;

namespace SoundSpace.Api
{
    public static class MigrationManager
    {
        // Áp dụng migration còn thiếu rồi seed dữ liệu mặc định khi ứng dụng khởi động.
        public static async Task MigrateDatabaseAsync(this WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var services = scope.ServiceProvider;

            await services.GetRequiredService<ApplicationDbContext>().Database.MigrateAsync();
            await DataSeeder.SeedAsync(
                services.GetRequiredService<UserManager<AppUser>>(),
                services.GetRequiredService<RoleManager<AppRole>>());
        }
    }
}
