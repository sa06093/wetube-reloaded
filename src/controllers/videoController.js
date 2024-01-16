import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

// Home 설정--------------------------------------------------------------------------------------------------------------------------------------------------------
// await은 asynchorous한 function 안에서만 사용 가능해서, async 적어줌
export const home = async (req, res) => {
    // await을 find 앞에 적으면, find는 callback을 필요로 하지 않다는 것을 알게됨 => find는 찾아낸 비디오를 바로 출력해줌
    const videos = await Video.find({}) // JS는 여기서 결과값을 받을때까지 기다려줌 (await으로 인해) + 최근에 만든게 위로
        .sort({ createdAt: "desc" })
        .populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
};

// Home 설정--------------------------------------------------------------------------------------------------------------------------------------------------------
export const watch = async (req, res) => {
    const { id } = req.params;  // req.params에서 id값 받음 (parameter은 videoRouter에서의 주소)

    // video의 owner에 owner의 전체 정보를 불러옴
    const video = await Video.findById(id).populate("owner").populate("comments"); // 받은 id로 video를 검색
    if (!video) {
        // 만약 video가 존재하지 않는다면
        return res.render("404", { pageTitle: "Video not found." });   // 404 페이지 반환
    }
    // return이 있어서 굳이 else 안해줘도 됨
    return res.render("watch", { pageTitle: video.title, video }); //watch.pug에 pageTitle 주고, video Object 준 것을 토대로 watch.pug 랜더링
};

// Edit 설정--------------------------------------------------------------------------------------------------------------------------------------------------------
export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {user: {_id}} = req.session;
    // getEdit에서는 Video object를 직접 받아야함. => object를 edit template로 보내줘야 하기 때문
    const video = await Video.findById(id);
    if (!video) {
        // 만약 video가 존재하지 않는다면
        return res.status(404).render("404", { pageTitle: "Video not found." });   // 404 페이지 반환
    }
    // 만약 비디오 주인과 현재 로그인한 사용자가 다르다면 home으로 돌려보냄
    if(String(video.owner) !== String(_id)){
        req.flash("error", "You are not the owner of the video.");
        return res.status(403).redrect("/")
    }
    return res.render("edit", { pageTitle: `Edit ${video.title}`, video }); //watch.pug에 pageTitle 주고, video Object 줌
};

export const postEdit = async (req, res) => {
    const { id } = req.params;  // parameter은 videoRouter에서의 주소
    const { title, description, hashtags } = req.body;  // form의 값 받아오기
    const {user: {_id}} = req.session;
    // postEdit에서는 Video object를 직접 받아줄 필요는 없음. => 그냥 특정 아이디를 가진 비디오가 있는지 없는지 boolean으로 받음
    const video = await Video.exists({_id: id}); // _id값이 id인 video가 존재하는지 확인
    if (!video) {
        // 만약 video가 존재하지 않는다면
        return res.status(404).render("404", { pageTitle: "Video not found." });   // 404 페이지 반환
    }
    // 만약 비디오 주인과 현재 로그인한 사용자가 다르다면 home으로 돌려보냄
    if(String(video.owner) !== String(_id)){
        return res.status(403).redrect("/")
    }
    // findByIdAndUpdate == 불러오기와 수정을 한방에 해줄 수 있음
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    });
    return res.redirect(`/videos/${id}`);   // redirect 해주기
};

// Upload 설정-------------------------------------------------------------------------------------------------------------------------------------------------------
export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const {path: fileUrl } = req.file;
    const { title, description, hashtags } = req.body;
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });

        // User에 새로만든 video의 id값 넣어주기
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();

        // Video 생성에 문제가 없다면 home으로 보내짐
        return res.redirect("/");
    } catch(error) {
        // Video 생성에 문제가 있다면, 에러를 잡아내고, upload를 다시 render함.
        console.log(error);
        return res.status(400).render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};
    
// Delete 설정------------------------------------------------------------------------------------------------------------------------------------------------------
export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const {user: {_id}} = req.session;
    const video = await Video.findById(id);
    if (!video) {
        // 만약 video가 존재하지 않는다면
        return res.status(404).render("404", { pageTitle: "Video not found." });   // 404 페이지 반환
    }
    // 만약 비디오 주인과 현재 로그인한 사용자가 다르다면 home으로 돌려보냄
    if(String(video.owner) !== String(_id)){
        return res.status(403).redrect("/")
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");   // home으로 돌아가기
};


// Search 설정------------------------------------------------------------------------------------------------------------------------------------------------------
export const search = async (req, res) => {
    // request에서 검색어를 가져옴
    const { keyword } = req.query;
    let videos =[];
    // 만약 검색어가 존재한다면
    if(keyword){
        // Video 모델에서 title 필드에 대해 대소문자를 무시하고 검색어와 일치하는 부분을 찾음
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),   //  정규표현식 객체를 생성
            },
        }).populate("owner");
    }
    // 검색 결과를 렌더링하여 클라이언트에 전송
    return res.render("search", { pageTitle: "Search", videos });
};


// 동영상 조회수 설정------------------------------------------------------------------------------------------------------------------------------------------------
export const registerView = async (req, res) => {
    // Url에서 동영상 id값 가져옴
    const { id } =req.params;
    // 그 id값을 가진 비디오를 찾음
    const video = await Video.findById(id);
    if (!video) {
        // 만약 비디오가 없다면 404 보냄
        return res.sendStatus(404);
    }
    // 비디오 있으면 view값에 1 더해줌
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};


// 댓글 생성 관련---------------------------------------------------------------------------------------------------------------------------------------------------
export const createComment = async (req, res) => {
    const {
        session: {user},
        body: { text },
        params: { id },
    } = req;

    // 받은 id값을 바탕으로 video를 찾음
    const video = await Video.findById(id);

    // 만약 video가 없으면 404값을 띄워줌
    if(!video){
        return res.sendStatus(404);
    }

    // video가 있으면 Comment를 생성해줌
    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id,
    });

    // 비디오에 댓글을 생성해준 후 video 업데이트 해주기
    video.comments.push(comment._id);
    video.save();

    // frontend에 새로 생긴 댓글의 id값을 보내줌
    return res.status(201).json({ newCommentId: comment._id });
}