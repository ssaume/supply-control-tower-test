# 供需承諾控制塔互動原型

這是一個可直接部署到 GitHub Pages 的純前端互動原型，示範跨台灣、中國、泰國共 18 座工廠的需求變更與承諾治理流程。

## 廠區設定

- 台灣：4 座工廠
- 中國：6 座工廠
- 泰國：8 座工廠

## 涵蓋情境

1. 全球／地區／工廠控制塔
2. 需求變更事件與版本差異
3. 凍結區、重大變更與升級判定
4. 無限能力與有限能力同步模擬
5. 產能、物料、設備、人力瓶頸分析
6. 責任人處理方案與條件式 Commit
7. 跨部門方案比較與高階決策
8. 正式版本核准
9. 執行追蹤、原因歸屬與 Highlight
10. 響應式電腦／平板／手機版面

## 本機預覽

直接開啟 `index.html` 即可，或執行：

```bash
python -m http.server 8000
```

再前往 `http://localhost:8000`。

## 部署到 GitHub Pages

1. 在 GitHub 建立新的 repository。
2. 將 `index.html`、`styles.css`、`app.js` 上傳到 repository 根目錄。
3. 進入 `Settings` → `Pages`。
4. `Build and deployment` 選擇 `Deploy from a branch`。
5. Branch 選擇 `main`，資料夾選擇 `/ (root)`。
6. 儲存後等待 GitHub 產生公開網址。

## 技術說明

- 純 HTML、CSS、JavaScript
- 無外部套件、無後端依賴
- GitHub Pages 可直接執行
- 使用 localStorage 保存原型操作狀態
- 點選「重設示範資料」可回復初始狀態
