using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SoundSpace.Core.ConfigOptions;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SoundSpace.Api.Services
{
    public class TokenService : ITokenService
    {
        private readonly JwtTokenSettings _jwtTokenSettings;

        public TokenService(IOptions<JwtTokenSettings> jwtTokenSettings)
        {
            _jwtTokenSettings = jwtTokenSettings.Value;
        }

        // Tạo access token (JWT) ký bằng HMAC-SHA256, hết hạn sau ExpireInHours giờ.
        public string GenerateAccessToken(IEnumerable<Claim> claims)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtTokenSettings.Key));
            var signingCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtTokenSettings.Issuer,
                audience: _jwtTokenSettings.Issuer,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(_jwtTokenSettings.ExpireInHours),
                signingCredentials: signingCredentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // Refresh token là chuỗi ngẫu nhiên, được lưu vào AppUser để đối chiếu khi xin token mới.
        public string GenerateRefreshToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        }

        // Đọc claim từ access token đã hết hạn (vẫn kiểm tra chữ ký, issuer, audience; chỉ bỏ qua hạn dùng).
        // Trả về null nếu token bị sửa, sai định dạng hoặc không phải do SoundSpace cấp.
        public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = _jwtTokenSettings.Issuer,
                ValidAudience = _jwtTokenSettings.Issuer,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtTokenSettings.Key)),
                ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
                ValidateLifetime = false
            };

            try
            {
                return new JwtSecurityTokenHandler().ValidateToken(token, tokenValidationParameters, out _);
            }
            catch (Exception ex) when (ex is SecurityTokenException or ArgumentException)
            {
                return null;
            }
        }
    }
}
