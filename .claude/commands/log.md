
- **Trước khi code:** Nếu sửa đổi lớn liên quan đến nhiều tầng (Domain -> Application -> API), hãy tóm tắt kế hoạch ngắn gọn trước khi tạo file.
- **Sau khi sửa code:** Luôn chạy `dotnet build` để đảm bảo không có lỗi biên dịch hoặc warning mới.
Hãy kiểm tra các thay đổi vừa thực hiện trong phiên làm việc này (có thể xem qua `git diff` hoặc lịch sử hội thoại). 
Sau đó tóm tắt ngắn gọn và nối tiếp (append) vào đầu file `AI_LOG.md` theo định dạng:

## [YYYY-MM-DD] - <Tóm tắt ngắn gọn task vừa làm>
- **Thay đổi:** <Liệt kê các file và chức năng chính vừa sửa/tạo>
- **Quyết định kỹ thuật / Fix lỗi:** <Ghi chú các điểm quan trọng cần nhớ>
- **Lưu ý kỹ thuật / Migration:** <Ghi chú nếu có thay đổi DB, config hoặc package>
- **Checklist [x] Các việc đã thực hiện:** <Những việc còn dang dở để đề phòng trường hợp thiết bị gặp sự cố như mất kết nối mạng, thiết bị hư hỏng phần cứng hoặc sập nguồn trong lúc mệnh lệnh đang được thực thi, một task đang được thực hiện và công việc còn đang dang dở,... để sau khi thiết bị hoạt động lại thì có thể tiếp tục phiên làm việc đang dang dở đó>
- **Next steps:** <Việc cần làm tiếp>