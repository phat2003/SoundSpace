using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SoundSpace.Api;
using SoundSpace.Api.Services;
using SoundSpace.Core.ConfigOptions;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.Models.Auth;
using SoundSpace.Data;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;
var connectionString = configuration.GetConnectionString("DefaultConnection");
// Add services to the container.

//Config DB Context and ASP.NET Core Identity
builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));

builder.Services.AddIdentity<AppUser, AppRole>(options => options.SignIn.RequireConfirmedAccount = false)
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddErrorDescriber<VietnameseIdentityErrorDescriber>(); // Thông báo lỗi Identity bằng tiếng Việt

builder.Services.Configure<IdentityOptions>(options =>
{
    // Password settings.
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 1;

    // Lockout settings.
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings.
    options.User.AllowedUserNameCharacters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true; // Đăng nhập bằng email nên email không được trùng
});

// AutoMapper: quét các Profile nằm trong project Core (ví dụ RegisterRequest.AutoMapperProfiles)
builder.Services.AddAutoMapper(typeof(RegisterRequest));

//Authen and author
builder.Services.Configure<JwtTokenSettings>(configuration.GetSection("JwtTokenSettings"));
builder.Services.AddScoped<ITokenService, TokenService>();

// Báo lỗi ngay khi khởi động nếu quên cấu hình khoá JWT (HMAC-SHA256 cần khoá ≥ 32 byte).
var jwtKey = configuration["JwtTokenSettings:Key"];
if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException("Chưa cấu hình JwtTokenSettings:Key (tối thiểu 32 ký tự) trong appsettings hoặc biến môi trường.");
}

// Đặt JWT làm scheme mặc định (AddIdentity mặc định dùng cookie).
builder.Services.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(cfg =>
{
    cfg.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        ValidIssuer = configuration["JwtTokenSettings:Issuer"],
        ValidAudience = configuration["JwtTokenSettings:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
    // Trả lời 401 / 403 kèm thông báo tiếng Việt thay vì body rỗng.
    cfg.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "text/plain; charset=utf-8";
            await context.Response.WriteAsync(context.AuthenticateFailure is SecurityTokenExpiredException
                ? "Phiên đăng nhập đã hết hạn."
                : "Bạn cần đăng nhập để sử dụng chức năng này.");
        },
        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "text/plain; charset=utf-8";
            await context.Response.WriteAsync("Bạn không có quyền sử dụng chức năng này.");
        }
    };
});

//Default config for ASP.NET Core
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.CustomOperationIds(apiDesc =>
    {
        return apiDesc.TryGetMethodInfo(out MethodInfo methodInfo) ? methodInfo.Name : null;
    });
    // Nút "Authorize" trên Swagger: dán access token (không cần gõ "Bearer "), Swagger tự gắn header Authorization.
    var bearerScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Dán access token lấy từ POST /api/auth/login.",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = JwtBearerDefaults.AuthenticationScheme }
    };
    c.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, bearerScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { [bearerScheme] = Array.Empty<string>() });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        //c.SwaggerEndpoint("AdminAPI/swagger.json", "Admin API");
        c.DisplayOperationId();
        c.DisplayRequestDuration();
    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

//seed database
await app.MigrateDatabaseAsync();

app.Run();
