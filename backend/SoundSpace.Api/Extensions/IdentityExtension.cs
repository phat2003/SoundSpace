using SoundSpace.Core.SeedWorks.Constants;
using System.Security.Claims;

namespace SoundSpace.Api.Extensions
{
    public static class IdentityExtension
    {
        // Lấy Id người dùng từ claim "id" trong JWT.
        public static Guid GetUserId(this ClaimsPrincipal claimsPrincipal)
        {
            return Guid.Parse(claimsPrincipal.FindFirstValue(UserClaims.Id)!);
        }
    }
}
