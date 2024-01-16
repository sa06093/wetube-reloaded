// 환경변수 관련 import. init.js파일이 가장 먼저 실행되기 때문에, 여기에 적어줌
// require문으로 하지 않고 import 문으로 해야 JS파일 하나에만 적어도 됨.
import "dotenv/config";

// 내 서버 mongo에 연결
import "./db";

// Video, User model import 해주기
import "./models/Video";
import "./models/User";
import "./models/Comment";

// server.js에서 app 가져오기
import app from "./server"



// 외부에 개방----------------------------------------------------------------------------------------

const PORT = process.env.PORT || 4000;

// Server에 가는 법 => (localhost:4000 입력)
const handleListening = () => console.log(`✔️ Server listening on port http://localhost:${PORT}`);

// app이 request를 listening하게 해주기
// 4000번 포트를 사용해 listening 해주고, 듣기를 시작하면 handleListening 함수를 콜백해줌
app.listen(PORT, handleListening);