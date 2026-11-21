// Giống MediaSettings của backend (AllowImageFileTypes, MaxImageSizeInMB) để báo lỗi ngay, đỡ upload thừa.
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
export const MAX_IMAGE_SIZE_MB = 5;

/** Trả về thông báo lỗi, hoặc null nếu ảnh hợp lệ. */
export const validateImage = (file: File): string | null => {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!IMAGE_EXTENSIONS.includes(extension)) {
    return 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.';
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Ảnh tối đa ${MAX_IMAGE_SIZE_MB} MB.`;
  }
  return null;
};
