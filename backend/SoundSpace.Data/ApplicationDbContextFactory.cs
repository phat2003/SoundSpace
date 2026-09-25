using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace SoundSpace.Data
{
    // Chỉ dùng lúc thiết kế: lệnh "dotnet ef migrations add" / "dotnet ef database update" gọi class này để tạo DbContext.
    // Chuỗi kết nối lấy từ appsettings của SoundSpace.Api, nên chỉ cần khai báo ở một nơi.
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        private const string ApiProjectFolder = "SoundSpace.Api";

        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

            var configuration = new ConfigurationBuilder()
                 .SetBasePath(FindApiProjectDirectory())
                 .AddJsonFile("appsettings.json", optional: true)
                 .AddJsonFile($"appsettings.{environment}.json", optional: true) // appsettings.Development.json ghi đè appsettings.json
                 .AddEnvironmentVariables() // Ghi đè bằng biến môi trường ConnectionStrings__DefaultConnection (dùng khi chuyển sang Neon)
                 .Build();
            var builder = new DbContextOptionsBuilder<ApplicationDbContext>();
            builder.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            return new ApplicationDbContext(builder.Options);
        }

        // dotnet ef có thể chạy từ thư mục backend, SoundSpace.Data hoặc SoundSpace.Api,
        // nên tìm thư mục SoundSpace.Api (nhận diện qua file SoundSpace.Api.csproj) từ thư mục hiện tại.
        private static string FindApiProjectDirectory()
        {
            var current = Directory.GetCurrentDirectory();
            var candidates = new[]
            {
                current,
                Path.Combine(current, ApiProjectFolder),
                Path.Combine(current, "..", ApiProjectFolder),
                Path.Combine(current, "backend", ApiProjectFolder),
            };

            return candidates.FirstOrDefault(dir => File.Exists(Path.Combine(dir, $"{ApiProjectFolder}.csproj")))
                ?? throw new DirectoryNotFoundException($"Không tìm thấy thư mục {ApiProjectFolder} (thư mục hiện tại: {current}).");
        }
    }
}
