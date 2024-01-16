const video = document.querySelector("video");

const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");

const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");

const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeLine = document.getElementById("timeline");

const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");

const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const textarea = document.getElementById("textarea");

// 플레이/중지 관련---------------------------------------------------------------------------------
const handlePlayClick = () => {
    // 클릭 시, 비디오가 멈춰있다면
    if(video.paused){
        video.play();   // 비디오 플레이 해줌
    } else{
        video.pause();  // 비디오 멈춰줌
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

// 스페이스바 관련
const handleSpaceDown = (event) => {
    if (event.keyCode === 32) {
    // 누른 키가 스페이스바라면
        if(video.paused){
            video.play();   // 비디오 플레이 해줌
        } else{
            video.pause();  // 비디오 멈춰줌
        }
        playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
        
        // 브라우저 기본 동작에 의해 스페이스바를 누를 시 브라우저 스크롤이 내려가는 문제 방지
        event.preventDefault();
    }
};

const handleSpace1 = () => {
    document.removeEventListener("keydown", handleSpaceDown);
    console.log("1");
};

const handleSpace2 = () => {
    document.addEventListener("keydown", handleSpaceDown);
    console.log("2");
};


// 음소거 버튼 관련---------------------------------------------------------------------------------
const handleMuteClick = () => {
    // 이미 음소거 상태라면
    if(video.muted){
        // 음소거 해제해줌
        video.muted = false;
    } else {
        // 음소거 해줌
        video.muted = true;
        localStorage.setItem("volume", 0);
    }
    // 음소거 되어있다면 mute 아이콘 띄우고, Mute가 해제되어 있다면, 스피커 아이콘 띄우기
    muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";

    // 음소거 되어있다면 볼륨바 값 0으로 만들어줌, 음소거 해제되면 기존 볼륨바 값 다시 복구
    volumeRange.value = video.muted ? 0 : volumeValue;
};


// 볼륨 Range바 관련-------------------------------------------------------------------------------
// 볼륨바 값 설정
let volumeValue = localStorage.getItem("volume");
if (volumeValue) {
    video.volume = volumeValue;
    volumeRange.value = volumeValue;
} else {
    video.volume = 0.5;
    volumeRange.value = 0.5;
}

const handleVolumeChange = (event) => {
    // 볼륨 Range바에의 value를 가져옴
    const {
        target: { value },
    } = event;

    // 만약 mute된 상태라면
    if (video.muted) {
        // mute 해제해줌
        video.muted = false;
        muteBtn.innerText = "Mute";
    }

    // 볼륨값을 볼륨 Range 바 값으로 만들어줌
    volumeValue = value;
    video.volume = value;
    localStorage.setItem("volume", value);
}


// 시간표시 관련---------------------------------------------------------------------------------------
const formatTime = (seconds) =>
    // Date 함수를 사용해 00:00 형식으로 시간을 변환해줌
    new Date(seconds * 1000).toISOString().substring(14, 19);

// 동영상 전체시간 설정
const handleLoadedMetadata = () => {
    // 동영상 전체 시간을 video.duration 함수를 사용해 구해줌
    totalTime.innerText = formatTime(Math.floor(video.duration));

    // ID가 timeLine인 input 태그의 max 값을 비디오 길이로 설정 
    timeLine.max = Math.floor(video.duration);
};

// 동영상 현재시간 설정
const handleTimeUpdate = () => {
    // 동영상 현재 시간을 video.currentTime을 활용해 구해줌
    currenTime.innerText = formatTime(Math.floor(video.currentTime));

    // ID가 timeLine인 input 태그의 값을 현재 시간으로 설정
    timeLine.value = Math.floor(video.currentTime); 
};

// 비디오 timeline 바 클릭 시 비디오의 시간을 옮기기 위한 함수-------------------------------------------
const handleTimelineChange = (event) => {
    const {
        target: { value },
    } = event;
    video.currentTime = value;
};


// 비디오 전체화면 관련---------------------------------------------------------------------------------
const handleFullScreen = () => {
    // 현재 화면에서 전체화면에 진입한 요소를 가져옴 (= videocontain)
    const fullscreen = document.fullscreenElement;

    // 전체화면에 진입한 요소가 존재한다면
    if (fullscreen) {
        // 전체화면에서 빠져나감
        document.exitFullscreen();
        // 아이콘을 확장모양으로 변경
        fullScreenIcon.classList = "fas fa-expand";
    } else {
        // 전체화면에 진입한 요소가 없다면 전체화면으로 진입시킴
        videoContainer.requestFullscreen();
        // 아이콘을 축소모양으로 변경
        fullScreenIcon.classList = "fas fa-compress";
    }
};


// 비디오 컨트롤 창 관련--------------------------------------------------------------------------------
let controlsTimeout = null;
let controlsMovementTimeout = null;

const hideControls = () => videoControls.classList.remove("showing");

// 마우스가 영역 위에 있을 때
const handleMouseMove = () => {
    // videoContainer에서 마우스가 움직이면,
    videoControls.classList.add("showing"); // showing 클래스 줌
    controlsMovementTimeout = setTimeout(hideControls, 3000);   // 3초 후에 컨트롤 바 감춤

    // 만약 마우스가 영역에 있으면
    if(controlsTimeout){
        // 영역 떠났을 때 진행했던 3초룰 제거해줌
        clearTimeout(controlsTimeout);
        // null값까지 줌
        controlsTimeout = null;
    }

    // 만약 마우스가 움직였다면
    if (controlsMovementTimeout) {
        // 3초룰 제거해 줌
        clearTimeout(controlsMovementTimeout);
        // null값까지 줌
        controlsMovementTimeout = null;
    }
    
};

// 마우스가 영역을 떠났을 때
const handleMouseLeave = () => {
    // 3초 후에 hideControls로 컨트롤 바 감춤
    controlsTimeout = setTimeout(hideControls, 3000);
};


// 동영상 조회수 관련----------------------------------------------------------------------------
const handleEnded = () => {
    const { id } = videoContainer.dataset;
    fetch(`/api/videos/${id}/view`,{
        // 그냥 fetch 하면 GET 해버려서 POST로 지정해줌
        method: "POST",
    });
};



playBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", handleSpaceDown);

muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);

video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
timeLine.addEventListener("input", handleTimelineChange);

fullScreenBtn.addEventListener("click", handleFullScreen);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);

video.addEventListener("ended", handleEnded);

textarea.addEventListener("click", handleSpace1);
videoContainer.addEventListener("click", handleSpace2);