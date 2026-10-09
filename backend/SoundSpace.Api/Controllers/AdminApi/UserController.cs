using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.Models;
using SoundSpace.Core.Models.UserManagement;
using SoundSpace.Core.SeedWorks.Constants;

namespace SoundSpace.Api.Controllers.AdminApi
{
    // Quản lý người dùng. Gắn role ở cấp class nên mọi action bên trong đều chỉ Admin gọi được.
    [Route("api/admin/user")]
    [ApiController]
    [Authorize(Roles = Roles.Admin)]
    public class UserController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;

        public UserController(UserManager<AppUser> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
        }

        // Danh sách người dùng có tìm kiếm (họ tên / email, không phân biệt hoa thường) và phân trang.
        [HttpGet("paging")]
        public async Task<ActionResult<PagedResult<UserInListDto>>> GetAllUsersPaging(string? keyword, int pageIndex = 1, int pageSize = 20)
        {
            pageIndex = Math.Max(pageIndex, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _userManager.Users;
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var pattern = $"%{keyword.Trim()}%";
                query = query.Where(x => EF.Functions.ILike(x.FullName, pattern)
                                         || (x.Email != null && EF.Functions.ILike(x.Email, pattern)));
            }

            var totalRow = await query.CountAsync();

            query = query.OrderByDescending(x => x.DateCreated)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize);

            return Ok(new PagedResult<UserInListDto>
            {
                Results = await _mapper.ProjectTo<UserInListDto>(query).ToListAsync(),
                CurrentPage = pageIndex,
                RowCount = totalRow,
                PageSize = pageSize
            });
        }
    }
}
