// 컴퓨터에 실행되고 있는 mongo database에 연결--------------------------------
import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection; // mongoose로 connection에 대한 access 줌

// 연결의 성공 여부 console로 출력--------------------------------------------
const handleOpen = () => console.log("✔️ Connected to DB!");
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error", handleError);
db.once("open", handleOpen);