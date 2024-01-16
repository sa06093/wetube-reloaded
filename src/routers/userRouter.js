import express from "express";
import { 
    getEdit,
    postEdit,
    logout,
    see,
    getChangePassword,
    postChangePassword,
} from "../controllers/userController";

import { 
    startGithubLogin,
    finishGithubLogin,
    startKakaoLogin,
    finishKakaoLogin,
    startGoogleLogin,
    finishGoogleLogin,
    startNaverLogin,
    finishNaverLogin,
} from "../controllers/socialLoginController";



import {
    protectorMiddleware,
    publicOnlyMiddleware,
    avatarUpload
} from "../middlewares"

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);

userRouter.route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    // postEdit 이전에 uploadFile 사용해서 req.file 사용가능
    // 파일 업로드 -> 파일명 변경 -> 파일이 uploads 폴더에 저장 -> 그 파일에 관한 정보를 받아 postEdit에 전달
    .post(avatarUpload.single("avatar"), postEdit);

userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);

userRouter.get("/google/start", publicOnlyMiddleware, startGoogleLogin);
userRouter.get("/google/finish", publicOnlyMiddleware, finishGoogleLogin);

userRouter.get("/naver/start", publicOnlyMiddleware, startNaverLogin);
userRouter.get("/naver/finish", publicOnlyMiddleware, finishNaverLogin);

userRouter.get("/:id", see);

export default userRouter;