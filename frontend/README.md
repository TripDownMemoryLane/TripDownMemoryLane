# 🧠 Memory Lane（記憶花園）

Memory Lane 是一個為 **長者與家人設計的回憶輔助系統**。  
使用者可以上傳照片、編輯回憶故事，並透過 AI 自動產生 **圖像導向的互動測驗（含語音）**，幫助長者回憶與認知刺激。

---

## ✨ 功能總覽

- 📸 **新增記憶（3 張照片）**
- 🗂️ 照片儲存在 **IndexedDB（避免 localStorage 容量限制）**
- ✍️ AI 生成故事後可人工編輯（Review Story）
- 🧠 AI 自動產生選擇題測驗
- 🖼️ **每一題測驗顯示對應照片**
- 🔊 **題目語音播放（TTS, base64 audio）**
- 🌙 支援 **Dark / Light Mode（已修正可讀性問題）**
- 🧓 長者友善介面（大按鈕、清楚對比）

---

## 🧱 技術架構

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- wouter（routing）
- IndexedDB（照片儲存）

### Backend（需另外啟動）
- AI 圖像理解 + 故事生成
- AI Quiz 生成（含語音）
- 預設位置：`http://localhost:4001`

---

## 📁 專案結構重點

```txt
src/
├── pages/
│   ├── Home.tsx          # 記憶列表首頁
│   ├── AddMemory.tsx     # 新增記憶（上傳照片）
│   ├── ReviewStory.tsx   # 編輯 AI 產生的故事
│   └── Quiz.tsx          # 測驗頁（資料準備）
│
├── components/
│   ├── MemoryCard.tsx
│   ├── QuizInterface.tsx # 測驗 UI（照片＋語音＋作答）
│   └── QuizResults.tsx
│
├── lib/
│   ├── photoDB.ts        # IndexedDB：儲存 / 讀取照片
│   └── deleteMemory.ts  # 刪除記憶（含 IndexedDB cleanup）
│
└── shared/
    └── schema.ts         # Memory / Quiz 型別定義
```

## 1.安裝套件
```
npm install
```

## 2.啟動前端
```
npm run dev
```
預設網址：
```
http://localhost:4000
```

## 3.啟動 AI Backend
Backend 預設位於：
```
http://localhost:4001
```
