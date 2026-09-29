using Microsoft.AspNetCore.Identity;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.SeedWorks.Constants;

namespace SoundSpace.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
        {
            await SeedRoleAsync(roleManager, Roles.Admin, "Quản trị viên");
            await SeedRoleAsync(roleManager, Roles.User, "Người dùng");

            // Tài khoản test: admin không bị khoá khi nhập sai mật khẩu, user giữ cơ chế khoá mặc định.
            await SeedUserAsync(userManager, "Phat", "admin", "jinluke@gmail.com", "Admin@123$", Roles.Admin, lockoutEnabled: false);
            await SeedUserAsync(userManager, "Người dùng test", "user", "user@soundspace.local", "User@123$", Roles.User, lockoutEnabled: true);
        }

        private static async Task SeedRoleAsync(RoleManager<AppRole> roleManager, string name, string displayName)
        {
            if (await roleManager.RoleExistsAsync(name))
            {
                return;
            }

            EnsureSucceeded(await roleManager.CreateAsync(new AppRole { Name = name, DisplayName = displayName }));
        }

        private static async Task SeedUserAsync(UserManager<AppUser> userManager, string fullName, string userName,
            string email, string password, string role, bool lockoutEnabled)
        {
            if (await userManager.FindByNameAsync(userName) != null)
            {
                return;
            }

            // UserManager tự hash mật khẩu, chuẩn hoá UserName/Email và tạo SecurityStamp.
            var user = new AppUser
            {
                FullName = fullName,
                UserName = userName,
                Email = email,
                IsActive = true
            };
            EnsureSucceeded(await userManager.CreateAsync(user, password));
            EnsureSucceeded(await userManager.SetLockoutEnabledAsync(user, lockoutEnabled));
            EnsureSucceeded(await userManager.AddToRoleAsync(user, role));
        }

        private static void EnsureSucceeded(IdentityResult result)
        {
            if (!result.Succeeded)
            {
                throw new InvalidOperationException(
                    "Seed dữ liệu thất bại: " + string.Join("; ", result.Errors.Select(e => e.Description)));
            }
        }
    }
}
