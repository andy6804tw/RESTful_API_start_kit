
# 安裝
[參考](https://neighborhood999.github.io/webpack-tutorial-gitbook/Part1/)

你需要全域安裝來使用 webpack 大部分的功能：
```
$ npm install -g webpack
```
然而 webpack 有些功能，像是優化的 plugins，需要你將它安裝在本機。像這種情況下你需要：
```
$ npm install --save-dev webpack
```
# 命令

如果要執行 webpack：
```
$ webpack
```
如果你想要 webpack 在你每次變更儲存檔案後自動執行 build：
```
$ webpack --watch
```

# 教學

1. 安裝 webpack 
在 package.json 中加入指令(只打包一個檔案)
```js
"scripts": {
    "build": "webpack src/js/main.js dist/bundle.js", //把maim.js產出bundle.js
    "build:prod": "webpack src/js/main.js dist/bundle.js -p" //同上只是檔案壓縮最小化
  }
```

2. 同時打包很多檔案

安裝babel
```
$ yarn add -D babel-preset-env babel-plugin-transform-object-rest-spread
$ yarn add -D webpack babel-core babel-loader webpack-node-externals
```

新增 webpack.config.js  Webpack 的設定檔
```js
/* webpack.config.js ： Webpack 的設定檔 */

const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: {
    index: './src/index.js'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: { // 設定你的檔案選項
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};

```
修改 package.json 中加入指令(只打包一個檔案)
```js
"scripts": {
    "build": "webpack -w",
    "build:prod": "webpack -p",
    "start": "nodemon dist/index.bundle.js"
  }
```
