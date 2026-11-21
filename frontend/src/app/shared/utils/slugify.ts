/**
 * Tạo slug cho đường dẫn từ chữ tiếng Việt, khớp quy tắc của backend (^[a-z0-9]+(-[a-z0-9]+)*$).
 * "Nhạc Trẻ & Rap Việt" -> "nhac-tre-rap-viet"
 */
export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh, dấu mũ...
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // ký tự khác chữ / số thành "-"
    .replace(/^-+|-+$/g, '');
