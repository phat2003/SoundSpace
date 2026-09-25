using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SoundSpace.Core.Domain.Identity
{
    /// <summary>
    /// Tài khoản người dùng. Email, UserName, PasswordHash... có sẵn từ IdentityUser.
    /// </summary>
    [Table("AppUsers")]
    public class AppUser : IdentityUser<Guid>
    {
        [Required]
        [MaxLength(100)]
        public required string FullName { get; set; }

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        /// <summary>false = tài khoản bị admin khoá.</summary>
        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        public DateTime? LastLoginDate { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime? DateModified { get; set; }
    }
}
