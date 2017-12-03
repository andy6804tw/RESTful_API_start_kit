
## 這節你將會學到
- 了解 middleware 運作方式
- 幫你專案加入常用的 middleware 中介軟體
  - body-parser
  - cors
  - morgan

## 何謂 middleware

所謂的 middleware 字面上意思就是中介軟體，簡單來說就是當你要進入某一個路由時他並不會馬上進去，而是先進入你設定的 middleware 執行完再回傳你裡面所設定的動作，最後才真正進去你的路由繼續執行。


## 中介軟體

### 解析器 body-parser

body-parser 是一個 HTTP 請求解析的中介軟體，使用這個插件可以解析 JSON、Raw、text、XML、URL-encoded 格式的請求，你可以在 Postman 上看到這些格式，僅設妳今天 POST 東西到 body 時，後端必須要靠 body-parser 來解析你的資料。


##### 1.安裝 body-parser

開啟終端機下載 body-parser 插件到 dependencies

```
yarn add body-parser
```

##### 2.設定 body-parser 的 middleware

還記得 express.js 這個檔案嗎？先前有提到他是管理所有 middleware 中介軟體的所有設定，所以我們今天就要在這個檔案內做設定，由於現階段還沒正式開始寫 API 所以這篇教學並不會馬上測試結果，等後面幾篇寫好 POST 的 API我們就可以馬上來試囉。

```js
import bodyParser from 'body-parser';

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```


## 跨來源資源共享 cors

[MDN](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/CORS) 是這樣解釋的，跨來源資源共享（Cross-Origin Resource Sharing (CORS)）是一種使用額外 HTTP 標頭來讓目前瀏覽網站的 user agent 能獲得訪問不同來源（網域）伺服器特定資源之權限的機制。當 user agent 請求一個不是目前文件來源——來自於不同網域（domain）、通訊協定（protocol）或通訊埠（port）的資源時，會建立一個跨來源 HTTP 請求（cross-origin HTTP request）。

所以當你在不同網域利用 ajax 或 fetch 存取 API 時會發現存取失敗的訊息，就是你未在標頭設定跨網域存取權限，所以這邊就要利用 cors 來快速建立讀取權限。

##### 1.安裝 cors

開啟終端機下載 cors 插件到 dependencies

```
yarn add cors
```

##### 2.設定 cors 的 middleware

一樣在 express.js 中輸入下列程式碼，app.use() 是一種配置 Express HTTP 服務器對象路由使用的中間件的方法，所以將下載套件引入就 ok 了

```js
import cors from 'cors';

// enable CORS - Cross Origin Resource Sharing
app.use(cors());
```

當然你也可以在每個路由中手動設定存取權限的標頭檔，此種方法就可以不用使用 cors 但很麻煩要在每個路由中設定 `res.header`。

```js
app.get('/', (req, res) => {
  res.send('歡迎 API => http://localhost:4000/api');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
});
```

## 連線存取紀錄 morgan

mogran 是一個 HTTP request logger 也就是在你存取某個 API 路徑時你的終端機就會顯示存取結果像是 200、404 的狀態碼，有助於開發階段的除錯。

##### 1.安裝 morgan

開啟終端機下載 mogran 插件到 dependencies

```
yarn add morgan
```

##### 2.設定 morgan 的 middleware

在 express.js 中配置下列程式碼 

```js
import morgan from 'morgan';

// HTTP request logger middleware for node.js
app.use(morgan('dev'));
```


