# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tổng quan

SoundSpace là website nghe nhạc (lấy ý tưởng từ SoundCloud, dùng nội bộ): Angular ở `frontend/`, ASP.NET Core 8 Web API ở `backend/`, PostgreSQL, file nhạc/ảnh trên Firebase Storage. Chủ dự án là người mới học Clean Architecture qua khoá học TeduBlog (https://github.com/phat2003/tedu-blog) — backend cố ý đi theo cấu trúc và cách viết của khoá học đó; khi thêm code backend, đối chiếu với TeduBlog trước khi tự nghĩ ra cấu trúc mới. Trao đổi với người dùng bằng tiếng Việt.

Triển khai dự kiến: Vercel (frontend), Render qua Docker (API), Neon (PostgreSQL). Hiện đang chạy PostgreSQL trên máy (local), chưa kết nối Neon.

## Lệnh thường dùng

Backend (chạy trong `backend/`):

```bash
dotnet build SoundSpace.Api
dotnet run --project SoundSpace.Api --launch-profile https     # Swagger: https://localhost:7270/swagger (http: 5165)
dotnet ef migrations add <Tên> --project SoundSpace.Data --startup-project SoundSpace.Api
dotnet ef database update --project SoundSpace.Data --startup-project SoundSpace.Api
```

Khởi động API sẽ tự `MigrateAsync()` và seed dữ liệu (xem `MigrationManager` bên dưới), nên thường không cần chạy `database update` thủ công. Chưa có project test cho backend.

Frontend (chạy trong `frontend/`):

```bash
npm start                                    # ng serve, http://localhost:4200
npm run build
npm test                                     # Vitest (chế độ watch)
npx ng test --watch=false                    # chạy một lần
npx ng test --watch=false --include src/app/shared/utils/format-duration.spec.ts   # một file test
npx prettier --write "src/**/*.{ts,html}"    # định dạng (.prettierrc)
```

Dùng `npm start` / `npx ng ...` (Angular CLI 22 cục bộ), không dùng `ng` toàn cục — máy có Angular CLI 17 cài global.

## Cấu hình

- `backend/SoundSpace.Api/appsettings.json` và `appsettings.Development.json` **không được commit** (xem `.gitignore`). Tạo chúng bằng cách sao chép `appsettingsexample.json` / `appsettingsexample.Development.json` rồi điền mật khẩu PostgreSQL. Khi thêm khoá cấu hình mới, cập nhật cả file `appsettingsexample*`.
- Chuỗi kết nối: `ConnectionStrings:DefaultConnection`, chỉ khai báo trong project Api. `ApplicationDbContextFactory` (dùng cho `dotnet ef`) tự tìm thư mục `SoundSpace.Api` và đọc `appsettings.json` + `appsettings.{ASPNETCORE_ENVIRONMENT}.json` + biến môi trường. `backend/SoundSpace.Data/appsettings.json` không được dùng.
- `SoundSpace.slnx` đang chứa đường dẫn tuyệt đối kiểu `../../../../duan/SoundSpace/...`, chỉ đúng khi repo nằm ở `C:\duan\SoundSpace`.

## Kiến trúc backend

Ba project, phụ thuộc một chiều: `Api → Data → Core`, `Api → Core`.

- **`SoundSpace.Core`** — entity trong `Domain/<nhóm nghiệp vụ>/` (`Identity`, `Catalog`, `Library`, `Activity`, `Discovery`), hằng số trong `SeedWorks/Constants` (`Roles.Admin`, `Roles.User`). Thư mục `IRepositories`, `Models`, `SeedWorks` dành cho interface repository/UnitOfWork và DTO theo kiểu TeduBlog.
- **`SoundSpace.Data`** — `ApplicationDbContext` (kế thừa `IdentityDbContext<AppUser, AppRole, Guid>`), migrations, `DataSeeder`, sau này là repository.
- **`SoundSpace.Api`** — `Program.cs` (DbContext + Identity), controller, và các service gọi dịch vụ ngoài (JWT, Firebase) đặt ở `Api/Services` như TeduBlog.

Quy ước entity (theo TeduBlog):
- Cấu hình bằng data annotation trên entity (`[Table]`, `[Index]`, `[PrimaryKey]` cho bảng nối, `[MaxLength]`, `required`), khoá chính `Guid`, có `DateCreated` / `DateModified`.
- **Không có navigation property** — chỉ lưu `…Id`. Khoá ngoại và hành vi xoá (Restrict / SetNull / Cascade) được khai báo tập trung trong `ApplicationDbContext` (các hàm `ConfigureCatalog`, `ConfigureLibrary`, `ConfigureActivity`) bằng `HasOne<T>().WithMany().HasForeignKey(...)`. Entity mới có khoá ngoại phải thêm cấu hình ở đó.
- Bảng Identity được đổi tên `AspNet*` → `App*` trong `ConfigureIdentity`; `[Table]` trên `AppUser`/`AppRole` bị Identity bỏ qua nên việc đổi tên phải nằm trong `OnModelCreating`.

Những hành vi dễ bỏ sót trong `ApplicationDbContext`:
- `SaveChanges`/`SaveChangesAsync` tự gán `DateCreated` (khi thêm) và `DateModified` (khi sửa) bằng `DateTime.UtcNow` — không tự gán trong code nghiệp vụ.
- Mọi `DateTime` được convert sang UTC (Npgsql chỉ nhận UTC cho `timestamp with time zone`). Luôn dùng `DateTime.UtcNow`, không dùng `DateTime.Now`.

Khởi động và seed: `Program.cs` gọi `await app.MigrateDatabaseAsync()` (`Api/MigrationManager.cs`) → áp migration → `DataSeeder.SeedAsync` tạo role `Admin`, `User` và hai tài khoản test `admin` (role Admin) và `user` (role User) qua `UserManager`/`RoleManager` (idempotent, kiểm tra theo tên).

Một số quyết định nghiệp vụ phản ánh trong model:
- `Song.AudioFilePath` là đường dẫn trong Firebase Storage (không phải URL công khai); API sẽ cấp signed URL khi phát. Ảnh lưu URL trực tiếp (`CoverImageUrl`, `AvatarUrl`).
- Một bài hát có nhiều nghệ sĩ qua `SongArtist` (`SortOrder = 0` là nghệ sĩ chính), đúng một thể loại (`GenreId`); `AlbumId` null = single.
- `ListenHistory.UserId` nullable: khách chưa đăng nhập vẫn nghe trọn bài và được tính lượt phát; `Song.PlayCount` là bộ đếm phi chuẩn hoá để xếp hạng.
- Ẩn/khoá bằng cờ (`IsVisible`, `IsActive`) thay vì xoá.

## Kiến trúc frontend

Angular 22 (standalone, signals, zoneless, `OnPush` mặc định) + Tailwind CSS v4. `frontend/CLAUDE.md` chứa quy ước Angular chi tiết (do Angular CLI sinh) — đọc khi làm frontend.

- `app.routes.ts`: mọi trang là con của layout `Shell` (`layout/shell`) và được lazy-load bằng `loadComponent`. `Shell` gồm `Sidebar`, `Header`, `router-outlet` và `PlayerBar`; player nằm ngoài `router-outlet` để nhạc không ngắt khi chuyển trang.
- `core/player/player.service.ts` (`@Service()` — decorator của Angular 22) giữ trạng thái player bằng signals. Hiện chỉ là trạng thái UI với bài demo, chưa phát audio thật.
- `features/<trang>/` hiện là trang giữ chỗ dùng `shared/components/page-placeholder`.
- Design token lấy từ thiết kế Google Stitch được khai báo trong `src/styles.css` (`@theme`: màu `surface-*`, `primary`, `secondary`…, spacing `space-*`, text `body-*`/`label-*`) và các `@utility font-display-*/headline-*/body-*/label-*` (mỗi class đặt cả font, cỡ, line-height, weight). Dùng các token này thay vì màu/cỡ chữ tuỳ ý.
- Chữ hiển thị là tiếng Việt; đường dẫn route bằng tiếng Anh (`/library`, `/genres`, `/song/:id`…). Trang `/song/:id` phải mở được mà không cần đăng nhập (link chia sẻ).

## Phạm vi MVP

Người nghe: đăng ký/đăng nhập (JWT), nghe nhạc với player cố định, hàng chờ, shuffle/repeat, khám phá, tìm kiếm, yêu thích, playlist, lưu album, theo dõi nghệ sĩ. Admin: CRUD thể loại/nghệ sĩ/album/bài hát (upload MP3 lên Firebase), quản lý người dùng, dashboard. **Ngoài phạm vi MVP**: Premium, người dùng tự đăng nhạc, bình luận, repost, gợi ý cá nhân hoá, lời bài hát chạy theo thời gian, thẻ xem trước Open Graph. Không thêm các tính năng này trừ khi được yêu cầu.

## Quy tắc code
- Viết comment bằng tiếng Việt
- Hạn chế code rác
- Component dùng arrow function
- Các code nào đã được viết sẵn trong dự án(có thể là code tham khảo từ project khác hoặc đại loại vậy,...) nhưng chưa phù hợp với dự án thì hãy refactoring lại cho phù hợp. Còn code nào đã có sẵn trong dự án và hoạt động ổn định rồi thì đừng thay đổi nó nếu không cần thiết
- Khi một trang/tính năng nào đó chỉ cần hiển thị một vài data của một bảng nào đó mà không phải hiển thị đầy đủ data trong bảng thì hãy tạo các DTO trong thư mục Models và dùng AutoMapper. Nhớ tạo thư mục và đặt tên tương ứng với chức năng mà cần tới DTO đó của bảng.


## Quy tắc bắt buộc (KHÔNG được vi phạm)
- ❌ KHÔNG xóa mock data khi chưa có API thật
- ❌ KHÔNG thay đổi cấu trúc thư mục features/
- ⚠️ LUÔN hỏi người dùng trước khi xóa bất kỳ file nào

## Trạng thái project
- 🔄 Tất cả các page đều đang trong quá trình phát triển
## Lưu ý khi làm việc
- Luôn đọc CLAUDE.md trước khi bắt đầu bất kỳ task nào
- Khi không chắc → hỏi trước, không tự ý sửa
- Ưu tiên sửa từng page một, không sửa nhiều file cùng lúc