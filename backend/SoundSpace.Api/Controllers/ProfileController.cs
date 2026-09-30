using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SoundSpace.Api.Extensions;
using SoundSpace.Api.Services;
using SoundSpace.Core.ConfigOptions;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.Models.Auth;
using SoundSpace.Core.Models.UserProfile;

namespace SoundSpace.Api.Controllers
{
    // Hồ sơ của chính người đang đăng nhập (xác định qua JWT), không nhận Id từ ngoài vào.
    [Route("api/profile")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly JwtTokenSettings _jwtTokenSettings;
        private readonly IMapper _mapper;

        public ProfileController(UserManager<AppUser> userManager,
            ITokenService tokenService,
            IOptions<JwtTokenSettings> jwtTokenSettings,
            IMapper mapper)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _jwtTokenSettings = jwtTokenSettings.Value;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<ProfileDto>> GetProfile()
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(await ToProfileDtoAsync(user));
        }

        [HttpPut]
        public async Task<ActionResult<ProfileDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return Unauthorized();
            }

            user.FullName = request.FullName.Trim();
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            return Ok(await ToProfileDtoAsync(user));
        }

        // Đổi mật khẩu rồi cấp cặp token mới: refresh token cũ (có thể đã lộ) không dùng được nữa,
        // còn phiên hiện tại vẫn tiếp tục mà không phải đăng nhập lại.
        [HttpPut("change-password")]
        public async Task<ActionResult<AuthenticatedResult>> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var user = await GetCurrentUserAsync();
            if (user == null)
            {
                return Unauthorized();
            }

            if (!await _userManager.CheckPasswordAsync(user, request.CurrentPassword))
            {
                return BadRequest(new[] { "Mật khẩu hiện tại không đúng." });
            }
            if (request.NewPassword == request.CurrentPassword)
            {
                return BadRequest(new[] { "Mật khẩu mới phải khác mật khẩu hiện tại." });
            }

            // ChangePasswordAsync kiểm tra quy tắc mật khẩu (Program.cs) và lưu hash mới.
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _tokenService.GenerateAccessToken(user.GetClaims(roles));
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtTokenSettings.RefreshTokenExpireInDays);
            await _userManager.UpdateAsync(user);

            return Ok(new AuthenticatedResult
            {
                Token = accessToken,
                RefreshToken = refreshToken
            });
        }

        private async Task<AppUser?> GetCurrentUserAsync()
        {
            return await _userManager.FindByIdAsync(User.GetUserId().ToString());
        }

        private async Task<ProfileDto> ToProfileDtoAsync(AppUser user)
        {
            var profile = _mapper.Map<ProfileDto>(user);
            profile.Roles = await _userManager.GetRolesAsync(user);
            return profile;
        }
    }
}
