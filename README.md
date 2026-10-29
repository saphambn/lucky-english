# Bé Học Tiếng Anh

Web app cảm ứng (iPad/iPhone) dạy tiếng Anh cho trẻ từ 3 tuổi tại Việt Nam.
Viết bằng React + TypeScript, build bằng Vite. Tự deploy lên GitHub Pages qua
`.github/workflows/pages.yml` mỗi lần push lên `main`.

## Chạy thử trên máy

```sh
npm install
npm run dev      # mở http://localhost:5173
npm run build    # ra thư mục dist/ (bản đưa lên web)
```

## Cấu trúc

- `src/data/topics.ts`: nội dung bài học (chủ đề, từ, cấp độ, trò chơi). Thêm từ hay chủ đề mới ở đây.
- `src/lib/say.ts`: mọi câu đọc. `window.ALL_LINES()` liệt kê các câu cần thu âm.
- `src/lib/audio.ts`: phát âm thanh (gói MP3 trong `public/audio/`, mở khóa âm thanh iOS, giọng máy dự phòng, tiếng hiệu ứng).
- `src/lib/store.ts`: cài đặt của bố mẹ và sao, lưu trong localStorage.
- `src/screens/`: từng màn hình (Start, Home, Topic, Learn, Find, Drag, Match, Celebrate).
- `src/components/`: phần dùng chung (thanh trên, hình, nút gạt, pháo giấy).
- `public/audio/`: gói MP3 + `packs.json` (key → [gói, vị trí, độ dài]).
