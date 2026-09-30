using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.SeedWorks.Constants;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SoundSpace.Api.Extensions
{
    public static class ClaimExtensions
    {
        // Tạo danh sách claim đưa vào JWT. Dùng chung cho đăng nhập và làm mới token
        // để token mới luôn phản ánh thông tin hiện tại của người dùng (tên, avatar, role).
        public static List<Claim> GetClaims(this AppUser user, IEnumerable<string> roles)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(UserClaims.Id, user.Id.ToString()),
                new(ClaimTypes.Name, user.UserName!),
                new(JwtRegisteredClaimNames.Email, user.Email!),
                new(UserClaims.FullName, user.FullName),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };
            if (user.AvatarUrl != null)
            {
                claims.Add(new(UserClaims.Avatar, user.AvatarUrl));
            }
            // Mỗi role một claim để dùng được [Authorize(Roles = Roles.Admin)].
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
            return claims;
        }
    }
}
