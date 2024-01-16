import multer from "multer";

// locals라는 middleware를 생성해줌
export const localsMiddleware = (req, res, next) => {
    // locals는 내가 뭐든 할 수 있는 Object (나의 pug template이 locals object에 접근 가능)
    
    // session의 loggedIn 값을 locals의 loggedIn값으로 줌
    res.locals.loggedIn = Boolean(req.session.loggedIn);    

    // 여기부턴 base.pug에서 사용할 값들을 만들어줌
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};
    next();
};


// 로그인을 하지 않는 사람이 보호하려고 하는 페이지에 가는 것을 막음
export const protectorMiddleware = (req, res, next) => {
    // 만약 로그인 되어있다면
    if(req.session.loggedIn){
        next(); // 그냥 넘어감
    } else {
        req.flash("error", "Log in first.");
        return res.redirect("/login");
    }
};

// 이미 로그인 한 사람이 다시 로그인 하러 가는 것을 막음
export const publicOnlyMiddleware = (req, res, next) => {
    // 로그인 되어있지 않다면
    if(!req.session.loggedIn){
        return next();
    } else {
        // 그냥 홈으로 돌아감
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};

// 아바타 업로드하는 Middleware
export const avatarUpload = multer({
    dest: "uploads/avatars/",
    limits: {
        fileSize: 3000000,
    },
});

// 비디오 업로드하는 Middleware
export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: {
        fileSize: 10000000,
    },
});