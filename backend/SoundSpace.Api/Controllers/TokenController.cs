using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SoundSpace.Api.Extensions;
using SoundSpace.Api.Services;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.Models.Auth;

namespace SoundSpace.Api.Controllers
{
    [Route("api/token")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;

        public TokenController(UserManager<AppUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        // Đổi access token hết hạn + refresh token lấy cặp token mới, không cần nhập lại mật khẩu.
        [HttpPost("refresh")]
        public async Task<ActionResult<AuthenticatedResult>> Refresh([FromBody] TokenRequest request)
        {
            const string sessionExpired = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";

            // Access token cũ chỉ dùng để biết là ai; chữ ký vẫn phải hợp lệ.
            var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
            {
                return Unauthorized(sessionExpired);
            }

            var user = await _userManager.FindByIdAsync(principal.GetUserId().ToString());
            if (user == null
                || user.RefreshToken != request.RefreshToken
                || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return Unauthorized(sessionExpired);
            }

            if (!user.IsActive)
            {
                return Unauthorized("Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.");
            }

            // Tạo claim từ dữ liệu hiện tại (không chép claim của token cũ) để role/tên mới đổi được cập nhật.
            var roles = await _userManager.GetRolesAsync(user);
            var newAccessToken = _tokenService.GenerateAccessToken(user.GetClaims(roles));

            // Refresh token chỉ dùng được một lần; hạn dùng giữ nguyên tính từ lần đăng nhập.
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            await _userManager.UpdateAsync(user);

            return Ok(new AuthenticatedResult
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        // Đăng xuất: huỷ refresh token để không xin được access token mới nữa.
        [HttpPost("revoke")]
        [Authorize]
        public async Task<IActionResult> Revoke()
        {
            var user = await _userManager.FindByIdAsync(User.GetUserId().ToString());
            if (user == null)
            {
                return Unauthorized();
            }

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _userManager.UpdateAsync(user);
            return NoContent();
        }
    }
}
