namespace SoundSpace.Api.Extensions
{
    public static class FormFileExtensions
    {
        // Kiểm tra đuôi file và dung lượng (theo MediaSettings), trả về thông báo lỗi hoặc null nếu hợp lệ.
        public static string? Validate(this IFormFile file, string allowFileTypes, int maxSizeInMB)
        {
            var allowedExtensions = allowFileTypes.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (!allowedExtensions.Contains(Path.GetExtension(file.FileName).ToLowerInvariant()))
            {
                return $"Chỉ nhận file {string.Join(", ", allowedExtensions)}.";
            }

            if (file.Length == 0)
            {
                return "File rỗng.";
            }

            if (file.Length > maxSizeInMB * 1024L * 1024L)
            {
                return $"File tối đa {maxSizeInMB} MB.";
            }

            return null;
        }
    }
}
