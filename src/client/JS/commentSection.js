const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");


// HTML에 댓글을 생성해주는 함수
const addComment = (text, id) => {
  // 비디오 댓글의 들어갈 곳을 찾아, li를 만들어줌
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");

  // 새로운 element에 id값과 className 추가
  newComment.dataset.id = id;
  newComment.className = "video__comment";

  // icon과 text와 X표시 추가
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);

  // li를 videoComments에 최종적으로 추가해줌
  videoComments.prepend(newComment);
};

// form을 Submit 했을 때 실행되는 함수
const handleSubmit = async (event) => {
  event.preventDefault(); // Submit 시 새로고침 되는 것 방지

  // textarea에 작성 된 값을 가져옴
  const textarea = form.querySelector("textarea");
  const text = textarea.value;

  // 비디오의 Id값을 가져옴
  const videoId = videoContainer.dataset.id;

  // 만약 text가 비어있다면, 아무것도 return 하지 않음
  if (text === "") {
    return;
  }

  // fetch를 사용해 요청을 보내면 apiRouter의 createComment함수 작동 (여기서 backend로 넘어감)
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // backend에 json을 보낸다고 알려줌
    },
    body: JSON.stringify({ text }), // backend에 json string을 보냄 => backend는 middleware 덕분에 평범한 JS object 받음
  });

  // 만약 status code가 201이면
  if (response.status === 201) {
    // 댓글창을 비움
    textarea.value = "";

    // backend로부터 새로 생긴 댓글의 id값을 받음
    const { newCommentId } = await response.json();

    // addComment 함수를 사용해 HTML에 댓글을 생성해줌
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}