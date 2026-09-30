using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SoundSpace.Api.Extensions;
using SoundSpace.Api.Services;
using SoundSpace.Core.ConfigOptions;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.Models.Auth;
using SoundSpace.Core.SeedWorks.Constants;

namespace SoundSpace.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly JwtTokenSettings _jwtTokenSettings;
        private readonly IMapper _mapper;

        public AuthController(UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager,
            ITokenService tokenService,
            IOptions<JwtTokenSettings> jwtTokenSettings,
            IMapper mapper)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _jwtTokenSettings = jwtTokenSettings.Value;
            _mapper = mapper;
        }

        // Đăng ký tài khoản người nghe. [ApiController] tự trả 400 nếu dữ liệu không qua validate của RegisterRequest.
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            request.Email = request.Email.Trim();

            if (await _userManager.FindByEmailAsync(request.Email) != null)
            {
                return Conflict("Email này đã được sử dụng.");
            }

            var user = _mapper.Map<AppUser>(request);

            // UserManager tự hash mật khẩu và kiểm tra quy tắc mật khẩu cấu hình trong Program.cs.
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            await _userManager.AddToRoleAsync(user, Roles.User);
            return Ok();
        }

        // Đăng nhập bằng email + mật khẩu, trả về access token (JWT) và refresh token.
        [HttpPost("login")]
        public async Task<ActionResult<AuthenticatedResult>> Login([FromBody] LoginRequest request)
        {
            const string invalidLogin = "Email hoặc mật khẩu không đúng.";

            var user = await _userManager.FindByEmailAsync(request.Email.Trim());
            if (user == null)
            {
                return Unauthorized(invalidLogin);
            }

            // Chỉ kiểm tra mật khẩu (không tạo cookie). Sai quá MaxFailedAccessAttempts lần thì tài khoản bị tạm khoá.
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            if (result.IsLockedOut)
            {
                return Unauthorized("Bạn đã nhập sai mật khẩu quá nhiều lần. Vui lòng thử lại sau ít phút.");
            }
            if (!result.Succeeded)
            {
                return Unauthorized(invalidLogin);
            }

            // Kiểm tra sau mật khẩu để không lộ tài khoản nào tồn tại / bị khoá cho người đoán mò.
            if (!user.IsActive)
            {
                return Unauthorized("Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên.");
            }

            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _tokenService.GenerateAccessToken(user.GetClaims(roles));
            var refreshToken = _tokenService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(_jwtTokenSettings.RefreshTokenExpireInDays);
            user.LastLoginDate = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return Ok(new AuthenticatedResult
            {
                Token = accessToken,
                RefreshToken = refreshToken
            });
        }
    }
}
