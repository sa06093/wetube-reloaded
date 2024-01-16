const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

// Download Recording 버튼 클릭 시 발동되는 함수
const handleDownload = () => {
    // a 태그를 만들고, 링크에다 녹화한 비디오 URL 연결
    const a = document.createElement("a");
    a.href = videoFile;

    // 링크에 download property를 주면, 해당 Url로 안넘어가고 해당 Url을 다운로드 하게 됨
    a.download = "MyRecording.webm";

    // 이렇게 만든 a 태그를 body에 추가해줌
    document.body.appendChild(a);
    
    // a 링크를 대신 클릭해줌
    a.click();
  };

// Stop Recording 버튼 클릭 시 발동되는 함수
const handleStop = () => {
    // startBtn을 다시 누르면 handleDownload 함수가 작동하도록 토글 형식으로 변경
    startBtn.innerText = "Download Recording";
    startBtn.removeEventListener("click", handleStop);
    startBtn.addEventListener("click", handleDownload);

    // 녹화를 멈춰줌
    recorder.stop();
}


// Start Recording 버튼 클릭 시 발동되는 함수
const handleStart = () => {
    // startBtn을 다시 누르면 handleStop 함수가 작동하도록 토글 형식으로 변경
    startBtn.innerText = "Stop Recording";
    startBtn.removeEventListener("click", handleStart);
    startBtn.addEventListener("click", handleStop);

    // stream이라는 미디어 스트림을 받아와서, video/webm 형식으로 설정된 MediaRecorder 객체를 생성
    recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    // ondataavailable은 녹화가 멈추면 발생하는 이벤트
    recorder.ondataavailable = (event) => {
        // 녹화된 데이터로 비디오 URL 생성
        videoFile = URL.createObjectURL(event.data)
        
        // 비디오 요소를 초기화 한 후, 녹화된 URL과 연결
        video.scrObject = null;
        video.src = videoFile;

        // 비디오를 반복 재생하도록 설정하고 재생 시작
        video.loop = true;
        video.play();
    };
    // 녹화 시작
    recorder.start();
};

const init = async () => {
    // mediaDevice로 마이크, 카메라와 같은 장비들에 접근 가능
    stream = await navigator.mediaDevices.getUserMedia({
        // 동영상에만 접근
        audio: false,
        video: true,
    });

    // 접근된 동영상을 upload.pug 파일의 video 태그에 srcObject로 넣어줌 => (stream을 위해 src로 안함)
    video.srcObject = stream;
    
    // 실시간으로 재생시키기 위해 play 해줌
    video.play();
};

init();

startBtn.addEventListener("click", handleStart);