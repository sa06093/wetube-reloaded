// npm과 NodeJS가 node_modules에서 express가 나올때까지 찾아보고, 찾은 express의 index.js를 불러옴
import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";

// 라우터 파일들에서 각각의 라우터들 import 해줌
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";

import { localsMiddleware } from "./middlewares";




const app = express();
const logger = morgan("dev");

// view engine을 src/views/pug로 설정해주기
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views/");

app.use(logger);
app.use(express.urlencoded({ extended: true})); // html form을 이해해서 우리가 사용할 수 있는 JS object 형식으로 통역해줌.
app.use(express.json());

// Session 미들웨어 추가
app.use(
    session({
        // 우리가 쿠키에 sign할 때 사용하는 String
        secret: process.env.COOKIE_SECRET,

        // resave는 세션에 변동이 있다면 무조건 세션을 최신화(false라면 세션에 변동이 있어도 최신화하지 않음)
        resave: false,

        // 세션을 수정할 때만 세션을 저장하고 쿠키를 넘겨줌 => 세션은 userController의 postLogin에서 로그인 시 수정됨.
        saveUninitialized: false,

        // 우리의 session이 Mongodb database에 저장되게 됨. (서버 재시작되더라도 로그아웃 안됨)
        store: MongoStore.create({ mongoUrl: process.env.DB_URL}),
    })
);

app.use(flash());

// 무조건 sessionMiddleware 다음에 와야함 => (그래야 localsMiddleware가 session object에 접근 가능)
app.use(localsMiddleware);

// uploads 폴더 전체를 브라우저에 노출시켜줌(avatar 업로드 목적) => 서버가 src="/uploads/~~~~~~"이해 가능
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));

app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);

app.use("/api", apiRouter);

export default app;