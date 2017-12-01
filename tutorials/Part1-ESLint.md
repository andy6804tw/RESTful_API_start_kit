# ESLint教學
> ESLint支援ES6與JSX語法，具高度設定彈性與擴充性的檢查語法工具，可提供程式開發者在語法上的錯誤警告，這邊我所使用的是Airbnb的規範，簡單來說ESLint就是可以規範整個開發團隊中的coding style

# Usage
1. clone the repository
```
$ git clone https://github.com/andy6804tw/ESLint_tutorial.git
```
2. install package
```
$ npm install
$ cd ESLint_tutorial
```

## 教學
1. 初始化node
```
$ npm init -y
```
這邊會產出一個package.json,這個檔案專門管理node的各種套件

2. 安裝eslint與babel-eslint 
```
$ npm install eslint babel-eslint --save-dev
```

3. 使用eslint-airbnb-base
這邊可以參考至Airbnb的[GitHub](es6+的eslint-rules)
```
$ npm install eslint-config-airbnb-base eslint-plugin-import eslint --save-dev
```

4. 建立.eslintrc檔案並貼上下列程式
```js
{
  "parser": "babel-eslint", //parser: 指的是剖析器，如果你有用babel編譯器，就是設定"babel-eslint"
  "env": {
    "browser": true,
    "node": true
  },
  "extends": "airbnb-base",
  "rules": {
    "arrow-body-style": ["error", "always"],
    "comma-dangle": ["error", "never"], //該規則強制使用對象和數組文字中的逗號
    "no-console": 0 //關掉console.log()錯誤
  }
}
```
