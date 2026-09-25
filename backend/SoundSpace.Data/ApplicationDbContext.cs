using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SoundSpace.Core.Domain.Activity;
using SoundSpace.Core.Domain.Catalog;
using SoundSpace.Core.Domain.Discovery;
using SoundSpace.Core.Domain.Identity;
using SoundSpace.Core.Domain.Library;

namespace SoundSpace.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser, AppRole, Guid>
    {
        private const string DateCreatedField = "DateCreated";
        private const string DateModifiedField = "DateModified";

        public ApplicationDbContext(DbContextOptions options) : base(options)
        {
        }

        // Catalog - kho nhạc
        public DbSet<Artist> Artists { get; set; }
        public DbSet<Album> Albums { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Song> Songs { get; set; }
        public DbSet<SongArtist> SongArtists { get; set; }

        // Library - thư viện cá nhân
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistSong> PlaylistSongs { get; set; }
        public DbSet<FavoriteSong> FavoriteSongs { get; set; }
        public DbSet<FollowedArtist> FollowedArtists { get; set; }
        public DbSet<SavedAlbum> SavedAlbums { get; set; }

        // Activity - lượt nghe
        public DbSet<ListenHistory> ListenHistories { get; set; }

        // Discovery - banner trang Khám phá
        public DbSet<FeaturedBanner> FeaturedBanners { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Gọi trước để IdentityDbContext cấu hình sẵn các bảng Identity, sau đó mới ghi đè bên dưới.
            base.OnModelCreating(builder);

            ConfigureIdentity(builder);
            ConfigureCatalog(builder);
            ConfigureLibrary(builder);
            ConfigureActivity(builder);
        }

        private static void ConfigureIdentity(ModelBuilder builder)
        {
            builder.Entity<AppUser>().ToTable("AppUsers");
            builder.Entity<AppRole>().ToTable("AppRoles");

            builder.Entity<IdentityUserClaim<Guid>>().ToTable("AppUserClaims").HasKey(x => x.Id);

            builder.Entity<IdentityRoleClaim<Guid>>().ToTable("AppRoleClaims")
            .HasKey(x => x.Id);

            // Khoá là (LoginProvider, ProviderKey), không phải UserId:
            // một người có thể đăng nhập bằng nhiều nhà cung cấp (Google, Facebook...).
            builder.Entity<IdentityUserLogin<Guid>>().ToTable("AppUserLogins")
            .HasKey(x => new { x.LoginProvider, x.ProviderKey });

            builder.Entity<IdentityUserRole<Guid>>().ToTable("AppUserRoles")
            .HasKey(x => new { x.RoleId, x.UserId });

            // Khoá là (UserId, LoginProvider, Name): một người có thể có nhiều token khác nhau.
            builder.Entity<IdentityUserToken<Guid>>().ToTable("AppUserTokens")
               .HasKey(x => new { x.UserId, x.LoginProvider, x.Name });
        }

        private static void ConfigureCatalog(ModelBuilder builder)
        {
            // Không cho xoá nghệ sĩ khi còn album của họ.
            builder.Entity<Album>()
                .HasOne<Artist>().WithMany().HasForeignKey(x => x.ArtistId)
                .OnDelete(DeleteBehavior.Restrict);

            // Xoá album thì bài hát trở thành single, không bị xoá theo.
            builder.Entity<Song>()
                .HasOne<Album>().WithMany().HasForeignKey(x => x.AlbumId)
                .OnDelete(DeleteBehavior.SetNull);

            // Không cho xoá thể loại khi còn bài hát thuộc thể loại đó.
            builder.Entity<Song>()
                .HasOne<Genre>().WithMany().HasForeignKey(x => x.GenreId)
                .OnDelete(DeleteBehavior.Restrict);

            // Xoá tài khoản admin thì bài hát vẫn còn, chỉ bỏ thông tin người tải lên.
            builder.Entity<Song>()
                .HasOne<AppUser>().WithMany().HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<SongArtist>()
                .HasOne<Song>().WithMany().HasForeignKey(x => x.SongId)
                .OnDelete(DeleteBehavior.Cascade);

            // Không cho xoá nghệ sĩ khi còn bài hát của họ.
            builder.Entity<SongArtist>()
                .HasOne<Artist>().WithMany().HasForeignKey(x => x.ArtistId)
                .OnDelete(DeleteBehavior.Restrict);
        }

        private static void ConfigureLibrary(ModelBuilder builder)
        {
            // Xoá tài khoản hoặc nội dung thì xoá luôn dữ liệu thư viện liên quan.
            builder.Entity<Playlist>()
                .HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PlaylistSong>()
                .HasOne<Playlist>().WithMany().HasForeignKey(x => x.PlaylistId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<PlaylistSong>()
                .HasOne<Song>().WithMany().HasForeignKey(x => x.SongId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FavoriteSong>()
                .HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<FavoriteSong>()
                .HasOne<Song>().WithMany().HasForeignKey(x => x.SongId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<FollowedArtist>()
                .HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<FollowedArtist>()
                .HasOne<Artist>().WithMany().HasForeignKey(x => x.ArtistId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SavedAlbum>()
                .HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            builder.Entity<SavedAlbum>()
                .HasOne<Album>().WithMany().HasForeignKey(x => x.AlbumId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        private static void ConfigureActivity(ModelBuilder builder)
        {
            builder.Entity<ListenHistory>()
                .HasOne<Song>().WithMany().HasForeignKey(x => x.SongId)
                .OnDelete(DeleteBehavior.Cascade);

            // Xoá tài khoản vẫn giữ lượt nghe để thống kê, chỉ bỏ liên kết người dùng.
            builder.Entity<ListenHistory>()
                .HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            // PostgreSQL lưu DateTime dạng "timestamp with time zone" và chỉ nhận giờ UTC.
            // Chuyển mọi DateTime về UTC trước khi lưu, tránh lỗi khi giá trị có Kind = Unspecified (ví dụ "2026-10-01").
            configurationBuilder.Properties<DateTime>().HaveConversion<UtcDateTimeConverter>();
            configurationBuilder.Properties<DateTime?>().HaveConversion<UtcDateTimeConverter>();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            SetAuditDates();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
            SetAuditDates();
            return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        // Tự điền DateCreated khi thêm mới và DateModified khi sửa (giờ UTC).
        private void SetAuditDates()
        {
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries())
            {
                if (entry.State == EntityState.Added && entry.Metadata.FindProperty(DateCreatedField) != null)
                {
                    entry.Property(DateCreatedField).CurrentValue = now;
                }
                else if (entry.State == EntityState.Modified && entry.Metadata.FindProperty(DateModifiedField) != null)
                {
                    entry.Property(DateModifiedField).CurrentValue = now;
                }
            }
        }

        private sealed class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
        {
            public UtcDateTimeConverter()
                : base(
                    value => value.Kind == DateTimeKind.Unspecified
                        ? DateTime.SpecifyKind(value, DateTimeKind.Utc)
                        : value.ToUniversalTime(),
                    value => DateTime.SpecifyKind(value, DateTimeKind.Utc))
            {
            }
        }
    }
}
