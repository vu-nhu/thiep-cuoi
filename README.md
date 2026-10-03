# Thiệp cưới online · Phan Vũ & Quỳnh Như

Lễ Vu Quy · 10:00 Thứ Bảy, 17.10.2026 (08/09 năm Bính Ngọ) · Sân bóng thôn An Bình, Quảng Ngãi

**Xem thiệp:** https://vu-nhu.github.io/thiep-cuoi/

## Cấu trúc

```
index.html          Nội dung thiệp + thẻ link preview (Zalo, Messenger, Facebook)
css/style.css       Màu sắc, kiểu chữ, hiệu ứng
js/main.js          Bì thư, nhạc, đếm ngược, album, form. Khối CONFIG ở đầu tệp:
                    musicUrl, album, mapUrl, mapEmbed, sheetApi
img/                Ảnh thiệp (đổi ảnh: chép đè, giữ nguyên tên)
img/thumbs/         Ảnh nhỏ 330x220 cho dải ảnh album
music/nhac-nen.mp3  Nhạc nền, phát sau khi khách mở phong bì
og-image.jpg        Ảnh xem trước khi dán link (1200x630)
huong-dan/          Hướng dẫn chi tiết (HUONG-DAN.html) + mã Google Apps Script (Code.gs)
```

## Cập nhật thiệp

1. Sửa tệp trong thư mục này.
2. `git add -A && git commit -m "Nội dung đã sửa" && git push`
3. Khoảng 1 phút sau GitHub Pages tự cập nhật.

## Link mời riêng theo tên khách

Thêm `?to=` vào cuối link, dấu cách viết là `%20`: `https://vu-nhu.github.io/thiep-cuoi/?to=Cô%20Hoa`.
Tạo hàng loạt link (kèm tin nhắn mời) bằng Google Sheet: xem `huong-dan/HUONG-DAN.html`, mục 8.
