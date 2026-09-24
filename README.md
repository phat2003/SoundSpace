<p align="center">
  <img src="frontend/public/logo-mark.png" alt="SoundSpace logo" width="96" height="96" />
</p>

<h1 align="center">SoundSpace</h1>

<p align="center">
  Website nghe nhạc trực tuyến — dự án cá nhân, lấy ý tưởng từ SoundCloud, dùng nội bộ.
</p>

<p align="center">
  <img alt=".NET 8" src="https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white" />
  <img alt="Angular 22" src="https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Status" src="https://img.shields.io/badge/trạng_thái-đang_phát_triển_MVP-orange" />
</p>

---

## Giới thiệu

SoundSpace là website nghe nhạc: người dùng tìm bài hát, nghe với thanh phát nhạc cố định ở cuối trang, thả tim và tạo playlist của riêng mình. Quản trị viên tải nhạc lên và quản lý nghệ sĩ, album, thể loại.

Dự án chỉ tham khảo ý tưởng từ SoundCloud. Đây là website kín, dùng nội bộ, không công khai với công cụ tìm kiếm.

> **Trạng thái:** đang xây dựng MVP. Khung giao diện (sidebar, header, thanh player, routing) đã xong; backend và các chức năng nghe nhạc đang được làm.

## Tính năng (MVP)

| Nhóm | Tính năng |
| --- | --- |
| Tài khoản | Đăng ký, đăng nhập (JWT), phân quyền User / Admin, hồ sơ cá nhân |
| Nghe nhạc | Thanh player cố định, phát / tạm dừng, tua, âm lượng, hàng chờ, trộn bài, lặp lại, đếm lượt nghe |
| Khám phá | Trang chủ (banner, top bài hát, nghệ sĩ nổi bật, album mới), trang nghệ sĩ, album, thể loại |
| Tìm kiếm & chia sẻ | Tìm bài hát / nghệ sĩ / album, trang bài hát riêng `/song/:id` để chia sẻ link |
| Thư viện | Yêu thích, playlist cá nhân, lưu album, theo dõi nghệ sĩ, nghe gần đây |
| Quản trị | Quản lý bài hát (upload MP3 + ảnh bìa), nghệ sĩ, album, thể loại, người dùng; dashboard |

**Khách chưa đăng nhập** vẫn nghe trọn bài và mở được link chia sẻ, nhưng không thể thích, lưu playlist, theo dõi nghệ sĩ hay bình luận.

**Để sau MVP:** gói Premium, người dùng tự đăng nhạc, bình luận, repost, gợi ý cá nhân hoá, lời bài hát chạy theo nhạc.

## Công nghệ

| Phần | Công nghệ |
| --- | --- |
| Frontend | Angular 22 (standalone components, signals), Tailwind CSS 4, Material Symbols |
| Backend | ASP.NET Core 8 Web API, Entity Framework Core |
| Cơ sở dữ liệu | PostgreSQL (Neon) |
| Lưu file nhạc, ảnh | Firebase Storage |
| Triển khai | Vercel (frontend), Render qua Docker (backend), Neon (database) |

## Kiến trúc

Backend chia theo Clean Architecture, cùng cách tổ chức với khoá học [TeduBlog](https://github.com/phat2003/tedu-blog):

```text
SoundSpace.Api   ──►  SoundSpace.Data  ──►  SoundSpace.Core
      │                                           ▲
      └───────────────────────────────────────────┘
```

| Project | Vai trò |
| --- | --- |
| `SoundSpace.Core` | Entity (Song, Artist, Album, Genre, Playlist…), model/DTO, interface repository và service. Không phụ thuộc project nào khác. |
| `SoundSpace.Data` | `DbContext`, cấu hình EF Core, migration, cài đặt repository và UnitOfWork. |
| `SoundSpace.Api` | Controller, xác thực JWT, cấu hình DI, Swagger, các service gọi dịch vụ ngoài (Firebase). |

```text
Trình duyệt (Angular, Vercel) ──REST + JWT──► ASP.NET Core API (Render) ──► PostgreSQL (Neon)
          │                                            │
          └────────── phát MP3, tải ảnh ──────► Firebase Storage ◄── upload / xoá
```

## Cấu trúc thư mục

```text
SoundSpace/
├── backend/
│   ├── SoundSpace.Api/          # Web API
│   ├── SoundSpace.Core/         # Domain, interface, model
│   └── SoundSpace.Data/         # EF Core, repository
├── frontend/                    # Angular app
│   └── src/app/
│       ├── core/                # service dùng chung: player, auth, API client
│       ├── layout/              # shell, sidebar, header, player-bar
│       ├── shared/              # component và hàm tiện ích dùng lại
│       ├── features/            # mỗi trang một thư mục (explore, library, admin…)
│       └── app.routes.ts
├── SoundSpace.slnx
└── README.md
```

## Chạy dự án trên máy

### Yêu cầu

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) 22.22+ hoặc 24.15+ (npm đi kèm)
- Visual Studio 2022 hoặc VS Code

### Backend

Lần đầu chạy, tin cậy chứng chỉ HTTPS dành cho môi trường phát triển:

```bash
dotnet dev-certs https --trust
```

Chạy API:

```bash
cd backend/SoundSpace.Api
dotnet run --launch-profile https
```

Swagger mở tại <https://localhost:7270/swagger>.

Chuỗi kết nối PostgreSQL và cấu hình Firebase, JWT sẽ nằm trong `appsettings.Development.json` hoặc [User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets). **Không commit mật khẩu hay khoá bí mật lên GitHub.**

### Frontend

```bash
cd frontend
npm install
npm start
```

Mở <http://localhost:4200>.

> Dự án dùng Angular CLI 22 cài cục bộ. Hãy chạy bằng `npm start` hoặc `npx ng ...` (ví dụ `npx ng generate component ...`) thay vì `ng` toàn cục, để tránh dùng nhầm phiên bản CLI cũ trên máy.

Chạy unit test:

```bash
npm test
```

## Giao diện

Giao diện được thiết kế bằng Google Stitch: tông tối, điểm nhấn tím neon `#d0bcff` và xanh cyan `#4cd7f6`, font **Sora** cho tiêu đề và **Plus Jakarta Sans** cho nội dung. Bảng màu, font và khoảng cách được khai báo thành token Tailwind trong [`src/styles.css`](frontend/src/styles.css), nên có thể dùng trực tiếp các class như `bg-surface-container-low`, `text-primary`, `px-space-lg`.

## Lộ trình

- [x] Khởi tạo repo, dự án Angular và ASP.NET Core Web API
- [x] Layout chung: sidebar, header, khung thanh player, routing
- [ ] Kết nối PostgreSQL (Neon), EF Core, migration đầu tiên
- [ ] Đăng ký, đăng nhập, JWT, phân quyền
- [ ] Trang quản trị: thể loại, nghệ sĩ, album, bài hát (upload lên Firebase)
- [ ] Trình phát nhạc: phát thật, hàng chờ, trộn bài, lặp lại, đếm lượt nghe
- [ ] Khám phá, tìm kiếm, trang bài hát chia sẻ được
- [ ] Thư viện cá nhân: yêu thích, playlist, theo dõi nghệ sĩ
- [ ] Responsive, triển khai lên Vercel + Render + Neon

## Giấy phép

Phát hành theo giấy phép [MIT](LICENSE.txt).
