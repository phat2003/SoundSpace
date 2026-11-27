## [2026-11-25] - Giao diện quản lý nghệ sĩ (nhánh feature/artist-crud)
- **Thay đổi:**
  - FE mới: `features/admin/artists/artist-list.ts` (/admin/artists), `artist-form.ts` (/admin/artists/new, /admin/artists/:id/edit); `features/admin/image-upload-field.ts`; `core/admin/artist-admin.service.ts`; `core/models/artist.ts`. Sửa `features/admin/admin.routes.ts`.
  - BE: `ArtistInListDto` thêm `SongCount`/`AlbumCount`; mới `ArtistStatsDto`, `SeedWorks/Constants/ArtistFilters.cs`; `IArtistRepository`/`ArtistRepository` thêm tham số `status`, `GetStatsAsync`, `FillCountsAsync`; `ArtistController` thêm `status` cho paging và `GET api/admin/artist/stats`.
- **Quyết định kỹ thuật / Fix lỗi:**
  - Theo mẫu Stitch "Quản lý nghệ sĩ" + "Thêm / Sửa nghệ sĩ"; bỏ phần ngoài MVP / chưa có dữ liệu (kiểm duyệt, verified, thể loại chính, mạng xã hội, lượt nghe, xuất báo cáo, thanh định dạng tiểu sử) — người dùng đã chọn.
  - Thẻ số liệu + bộ lọc đổi sang Tổng / Đang hiển thị / Nổi bật / Đang ẩn; bấm thẻ = lọc.
  - Đếm bài hát/album: không có navigation property → 2 truy vấn GROUP BY cho id trong trang hiện tại.
  - Form là trang riêng (không phải hộp thoại); id lấy qua `withComponentInputBinding`; thông báo thành công truyền về danh sách bằng router state (`Router.currentNavigation()`).
  - Ảnh upload ngay khi chọn; ảnh vừa upload chưa lưu bị xoá khi đổi ảnh, bỏ ảnh hoặc rời trang (`DestroyRef.onDestroy`).
  - Thanh lưu `sticky bottom-24` để nằm trên thanh phát nhạc.
- **Lưu ý kỹ thuật / Migration:** Không có migration.
- **Checklist [x] Các việc đã thực hiện:**
  - [x] BE: lọc + đếm + stats, `dotnet build` OK
  - [x] FE: danh sách, form thêm/sửa, ô upload ảnh, `npm run build` OK
  - [x] Báo cáo vào Obsidian `Task/Admin - content management.md`
  - [x] Người dùng tự test, commit + PR (gồm cả phần API CRUD nghệ sĩ chưa commit)
- **Next steps:** API CRUD album.

## [2026-11-21] - API CRUD nghệ sĩ + upload ảnh (nhánh feature/artist-crud-api)
- **Thay đổi:**
  - Mới: `Core/Models/Catalog/ArtistDto.cs`, `ArtistInListDto.cs`, `CreateUpdateArtistRequest.cs`; `Core/IRepositories/IArtistRepository.cs`; `Data/Repositories/ArtistRepository.cs`; `Api/Controllers/AdminApi/ArtistController.cs`.
  - Sửa: `IUnitOfWork`/`UnitOfWork` (thêm `Artists`); `IFileStorageService`/`R2FileStorageService` (thêm `DeleteUnusedImagesAsync`, inject `ILogger`); `GenreController` (bỏ `TryDeleteImageAsync` + `ILogger`, dùng hàm chung).
- **Quyết định kỹ thuật / Fix lỗi:**
  - API giống Genre: paging, get all, get by id, POST, PUT `{id}`, DELETE `?ids=`.
  - Bảng/ô chọn dùng `ArtistInListDto` (không Bio, không ảnh bìa); GET theo id + POST/PUT trả `ArtistDto` đầy đủ.
  - Upload ảnh dùng API sẵn có `POST api/admin/media/image?type=artists`; PUT/DELETE tự dọn `AvatarUrl`/`CoverImageUrl` cũ trên R2 sau khi lưu DB.
  - Không xoá nghệ sĩ còn album (Album.ArtistId Restrict) hoặc bài hát (SongArtist Restrict) → 400; FollowedArtist tự xoá (Cascade).
  - Paging sắp theo `DateCreated` giảm dần (giống TeduBlog); get all theo tên A–Z.
- **Lưu ý kỹ thuật / Migration:** Không có migration/package/config.
- **Checklist [x] Các việc đã thực hiện:**
  - [x] DTO + repository + controller nghệ sĩ, gom hàm dọn ảnh R2
  - [x] `dotnet build` thành công (0 warning)
  - [x] Báo cáo vào Obsidian `Task/Admin - content management.md`
  - [ ] Người dùng tự test trên Swagger, commit + PR
- **Next steps:** Giao diện quản lý nghệ sĩ ở `/admin/artists` (cần màn mẫu Stitch trước khi làm).

## [2026-11-20] - Giao diện quản lý thể loại (nhánh feature/genre-manage-interface)
- **Thay đổi:**
  - Mới: `features/admin/genres/genre-list.ts` (trang /admin/genres), `genre-form-dialog.ts` (thêm/sửa); `shared/components/confirm-dialog/confirm-dialog.ts`; `core/admin/genre-admin.service.ts`, `media-admin.service.ts`; `core/models/genre.ts`; `shared/utils/slugify.ts` (+ spec), `validate-image.ts`.
  - Sửa: `features/admin/admin.routes.ts` (route genres dùng GenreList); `features/settings/avatar-form.ts` (dùng `validate-image.ts` chung).
- **Quyết định kỹ thuật / Fix lỗi:**
  - Stitch chưa có màn quản lý thể loại → bảng theo màn "Quản trị" (cột Thao tác sửa/xoá), form theo phong cách trang Cài đặt.
  - Hộp thoại dùng `<dialog>` gốc (`showModal`): tự giữ focus, Esc đóng; trang cha bật/tắt bằng `@if`.
  - Slug tự sinh theo tên (bỏ dấu tiếng Việt) cho tới khi admin tự gõ slug; khi sửa giữ slug cũ.
  - Ảnh bìa upload ngay khi chọn (`POST api/admin/media/image?type=genres`); huỷ form / đổi ảnh khác / bỏ ảnh thì xoá ảnh vừa upload chưa lưu (`DELETE api/admin/media/image`). Ảnh cũ đã lưu do API PUT tự xoá.
  - Lỗi NG8022: không đặt thuộc tính `min`/`max` trên input có `[formField]` (Signal Forms tự gắn từ validator).
- **Lưu ý kỹ thuật / Migration:** Không có. Chưa chạy `npx ng test` cho `slugify.spec.ts` (người dùng tự test).
- **Checklist [x] Các việc đã thực hiện:**
  - [x] Trang danh sách + tìm kiếm + phân trang, form thêm/sửa, xoá có xác nhận
  - [x] `npm run build` thành công
  - [ ] Người dùng tự test, commit + PR
- **Next steps:** API CRUD nghệ sĩ (dùng lại ConfirmDialog, MediaAdminService, slugify).

## [2026-11-18] - API CRUD thể loại (nhánh feature/genre-crud-api)
- **Thay đổi:**
  - Mới: `Core/Models/Catalog/GenreDto.cs`, `CreateUpdateGenreRequest.cs`; `Core/IRepositories/IGenreRepository.cs`; `Data/Repositories/GenreRepository.cs`; `Api/Controllers/AdminApi/GenreController.cs`.
  - Sửa: `Core/SeedWorks/IRepository.cs`, `Data/SeedWorks/RepositoryBase.cs` (thêm `CancellationToken` cho `GetByIdAsync`/`GetAllAsync`); `IUnitOfWork`/`UnitOfWork` (thêm `Genres`, `CompleteAsync(CancellationToken)`, UnitOfWork nhận thêm `IMapper`).
- **Quyết định kỹ thuật / Fix lỗi:**
  - Theo `PostCategoryController` của TeduBlog: paging, get all, get by id, POST, PUT, DELETE nhiều id (`?ids=`).
  - Khác TeduBlog: PUT dùng route `{id}`; slug kiểm tra trùng + regex; POST/PUT trả `GenreDto`; lỗi trả mảng chuỗi tiếng Việt.
  - Không xoá thể loại còn bài hát (FK Restrict) → 400, khuyên ẩn bằng `IsActive`.
  - Đổi/bỏ ảnh bìa hoặc xoá thể loại thì xoá ảnh cũ trên R2 sau khi lưu DB (lỗi chỉ ghi log).
  - Sắp xếp theo `SortOrder` rồi `Name`, tìm theo tên bằng `ILike`.
- **Lưu ý kỹ thuật / Migration:** Không có migration, không thêm package/config. `SongRepository`/`SongController` chưa truyền `CancellationToken` (giữ nguyên code ổn định).
- **Checklist [x] Các việc đã thực hiện:**
  - [x] Repository + DTO + controller thể loại
  - [x] `dotnet build` thành công (0 warning)
  - [ ] Người dùng tự test trên Swagger, commit + PR
- **Next steps:** Giao diện CRUD thể loại ở `/admin/genres` (dùng `DataTable`, `Pagination`, upload ảnh qua `api/admin/media/image?type=genres`).
