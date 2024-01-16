import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const videoRouter = express.Router();

// :id가 더 위에 오면 upload라는 id로 인식하는 문제 발생 => (id에 24자리 16진수 들어가도록 정규표현식 사용)
videoRouter.get("/:id([0-9a-f]{24})", watch);

videoRouter
    .route("/:id([0-9a-f]{24})/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(postEdit);

videoRouter
    .route("/:id([0-9a-f]{24})/delete")
    .all(protectorMiddleware)
    .get(deleteVideo);
    
videoRouter
    .route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(videoUpload.single("video"), postUpload);

export default videoRouter;