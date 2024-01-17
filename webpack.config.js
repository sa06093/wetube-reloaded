const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

const BASE_JS = "./src/client/JS/";

module.exports = {
    // entry는 우리가 변경하고자 하는 파일
    entry: {
        main: BASE_JS + "main.js",
        videoPlayer: BASE_JS + "videoPlayer.js",
        recorder: BASE_JS + "recorder.js",
        commentSection: BASE_JS + "commentSection.js",
    },

    plugins: [new MiniCssExtractPlugin({
        // css파일을 css 폴더 내부에 넣기 위해
        filename: "css/styles.css"
})],

    // 작업이 끝난 후 그 파일을 .assets/js 디렉토리에 저장
    output: {
        filename: "js/[name].js",
        // dirname은 현재 실행중인 스크립트 파일의 디렉토리 경로를 나타냄
        // resolve는 전달된 경로들을 기반으로 절대 경로를 생성
        path: path.resolve(__dirname, "assets"),

        // output folder이 build를 시작하기 전에 clean 해줌 (필요없는 파일들을 지워줌)
        clean: true,
    },
    module: {
        rules: [
            {
                // js 코드를 babel-loader라는 loader로 가공함
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                    },
                },
            },
            {
                // scss 코드를 babel-loader라는 loader로 가공함
                test: /\.scss$/,
                // webpack은 뒤에서부터 시작
                // 1. sass-loader을 통해 일반적인 css 파일로 변경
                // 2. @import, url()등의 최신형 css 코드를 브라우저가 이해하도록 변환
                // 3. MiniCssExtractPlugin을 통해 css를 브라우저에 보이게 함
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
        ],
    },
};
