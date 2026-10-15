// Dùng khi chạy `npm start` (ng serve). Trỏ tới API chạy trên máy bằng profile https của SoundSpace.Api.
// Không dùng http://localhost:5165: API sẽ chuyển hướng (307) sang https và trình duyệt chặn request CORS bị chuyển hướng.
export const environment = {
  apiUrl: 'https://localhost:7270/api',
};
