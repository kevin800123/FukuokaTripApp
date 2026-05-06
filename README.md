# 🌸 福岡放鬆之旅 (Fukuoka Trip App)

一款專為個人九州之旅打造的 **行程規劃 PWA（漸進式網頁應用）**。以日式美學為設計靈感，採用純前端技術實作，支援離線使用、即時天氣、Google Maps 導航與本地端資料儲存，可直接「安裝到手機桌面」當作獨立 App 使用。

> 🗓️ 預設行程：2026/4/27 ~ 5/1（共五天四夜，福岡・別府・北九州）

---

## ✨ 主要功能

| 功能 | 說明 |
| --- | --- |
| 📅 **多日行程時間軸** | 以 Day Tabs 切換每日行程，垂直時間軸視覺化呈現 |
| ➕ **快速新增行程** | 透過 FAB 浮動按鈕開啟 Bottom Sheet，輸入時間、類別、名稱、備註即可加入 |
| 🏷️ **五大行程類別** | 飲食 🍜 / 景點 ⛩️ / 購物 🛍️ / 交通 🚃 / 其他 📌 |
| 🗺️ **Google Maps 整合** | 點擊任一行程可開啟詳情，一鍵啟動 Google Maps 導航；支援自訂搜尋關鍵字 |
| 🌦️ **即時天氣預報** | 整合 [Open-Meteo API](https://open-meteo.com/)，顯示福岡每日天氣、氣溫與降雨機率 |
| 📴 **離線模式 (PWA)** | Service Worker 快取資源，離線可繼續瀏覽行程；天氣資料支援離線快取 |
| 💾 **本地端儲存** | 所有資料存於 `localStorage`，無需後端、零隱私疑慮 |
| 📱 **手機 / 電腦版切換** | 自動偵測螢幕寬度，亦可手動切換版型 |
| 🍞 **Toast 即時提示** | 新增成功、網路恢復、離線等狀態會即時顯示提示 |

---

## 🛠️ 技術棧

- **HTML5 / CSS3 / Vanilla JavaScript**（無任何框架，零依賴）
- **PWA**：`manifest.json` + Service Worker (`sw.js`)
- **資料儲存**：`localStorage`（純前端）
- **天氣 API**：[Open-Meteo](https://open-meteo.com/)（免費、無需 API Key）
- **字體**：Google Fonts — Noto Sans JP / Noto Serif JP
- **設計風格**：日式淡雅配色（主色 `#C67A7C` 櫻粉、底色 `#F9F8F6` 米白）

---

## 📂 專案結構

```
FukuokaTripApp/
├── index.html                          # 主頁面（單頁應用入口）
├── manifest.json                       # PWA 應用清單
├── sw.js                               # Service Worker（離線快取）
├── css/
│   └── style.css                       # 全站樣式
└── js/
    ├── main.js                         # 主邏輯（事件綁定、表單、Modal）
    ├── storage.js                      # localStorage 資料層 + 預設行程資料
    └── components/
        └── ItineraryTimeline.js        # 行程時間軸元件 + 天氣模組
```

---

## 🚀 快速開始

### 方法一：直接以靜態伺服器啟動（建議）

由於使用了 Service Worker，**必須透過 HTTP 伺服器**執行（直接雙擊 `index.html` 部分功能會失效）。

```bash
# 使用 Python 內建伺服器
python -m http.server 8080

# 或使用 Node.js 的 http-server
npx http-server -p 8080
```

接著於瀏覽器開啟 `http://localhost:8080` 即可。

### 方法二：使用 VS Code Live Server

於 VS Code 安裝 **Live Server** 擴充套件，右鍵 `index.html` → **Open with Live Server**。

### 方法三：部署至 GitHub Pages / Netlify / Vercel

直接將整個資料夾推上去即可，**無需任何建置流程**。

---

## 📲 安裝至手機桌面（PWA）

1. 用 **Chrome / Safari** 開啟網站
2. 點選瀏覽器選單的「**加到主畫面**」
3. 即可像 App 一樣全螢幕啟動，並支援離線使用

---

## 🎯 使用說明

### 切換日期
點擊頂部「Day 1 ~ Day 5」分頁，即可切換不同日期的行程。

### 新增行程
1. 點擊右下角 ➕ 浮動按鈕
2. 填寫「時間、類別、景點/活動、備註」
3. 按「儲存」即可，行程會自動依時間排序

### 查看行程詳情 / 開啟導航
1. 點擊任一行程卡片
2. 在彈出視窗中可：
   - 修改 Google Maps 搜尋關鍵字
   - 點擊「📍 開啟 Google Maps 導航」直接跳轉

### 重新取得天氣
點擊天氣面板右下角的「🔄 即時更新」按鈕。

---

## 🗃️ 資料模型

### `DayPlan`

```js
{
  id: 1,                  // 天數編號
  title: "抵達福岡與螃蟹大餐",
  date: "4/27",
  items: [ItineraryItem, ...]
}
```

### `ItineraryItem`

```js
{
  id: "abc123",           // 自動生成 ID
  time: "18:30",          // HH:mm
  category: "飲食",       // 飲食 | 景點 | 購物 | 交通 | 其他
  name: "晚餐：極致螃蟹料理",
  location: "札幌螃蟹本家", // 選填，Google Maps 搜尋用
  notes: "備註內容...",
  tags: ["必吃清單"],     // 選填
  createdAt: "ISO 8601",
  updatedAt: "ISO 8601"   // 選填
}
```

> 💡 所有資料儲存於 `localStorage` 的 `fukuoka-trip-v2` 鍵中，可在 DevTools → Application → Local Storage 檢視。

---

## 🌤️ 天氣 API 說明

- **資料來源**：Open-Meteo Forecast API
- **地點**：福岡市中央區（lat: 33.5902, lon: 130.4017）
- **欄位**：天氣代碼 (WMO)、最高/最低溫、降雨機率
- **離線支援**：成功取得後會快取於 `localStorage` 的 `weather-cache-v1`，網路中斷時自動 fallback

---

## 🔄 重置行程資料

若想恢復成預設的福岡行程：

1. 開啟 DevTools (F12)
2. Console 輸入：
   ```js
   localStorage.removeItem('fukuoka-trip-v2');
   location.reload();
   ```

---

## 🙋 個人化建議

若想改成自己的旅遊行程，編輯 `js/storage.js` 中的 `seedInitialData()` 函式，替換 `initialData` 陣列即可。記得同時：

1. 更新 `index.html` 的 `<title>` 與 header 標題
2. 修改 `manifest.json` 的 `name` / `theme_color`
3. 調整 `ItineraryTimeline.js` 中 `fetchWeather()` 的經緯度

---

## 📜 版本記錄

- **v2** — 整合即時天氣 API、Bottom Sheet 新增表單、行程詳情 Modal、Google Maps 編輯
- **v1** — 基礎時間軸與本地儲存

---

## 📝 授權

此專案為個人旅遊規劃用途，自由使用、修改與分享。

---

> 🌸 *願這趟旅程，留下滿滿的回憶。* 🌸
