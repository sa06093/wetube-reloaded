import User from "../models/User";
import fetch from "node-fetch";

// 깃헙 로그인 관련------------------------------------------------------------------------------------------------------------------------------------------------
export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id: process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
    // GitHub OAuth 엑세스 토큰 요청
    const baseUrl = "https://github.com/login/oauth/access_token";  // 액세스 토큰을 요청하기 위한 기본 Url
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();  // 위의 파라미터들을 문자열로 변환
    const finalUrl = `${baseUrl}?${params}`;    // 최종 요청 Url 생성

    // GitHub에 액세스 토큰 요청 및 응답 처리
    const tokenRequest = await (
        await fetch(finalUrl, {    // fetch('url')로 다른 서버를 통해 데이터를 가져올 수 있음
            // HTTP POST메서드를 사용
            method: "POST",

            // JSON 형식의 응답을 원한다는 것을 나타내줌
            headers:{
                Accept: "application/json",
            }
        })
    ).json();   // 받은 응답은 json을 사용하여 JSON 형식으로 파싱되고, 파싱된 JSON 데이터는 tokenRequest 변수에 저장됨.

    // 액세스 토큰의 존재 여부 확인
    // tokenRequest에 GitHub에서 반환한 JSON 데이터 저장되어 있는지 확인
    if("access_token" in tokenRequest){
        // 만약 access_token이 존재하면, 해당 토큰을 사용하여 GitHub API에 사용자 정보를 얻어오는 요청 수행
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        // 1. 유저 데이터 받기
        const userData = await (
            // GitHub API로 HTTP GET 요청을 보냄
            await fetch(`${apiUrl}/user`,{
                // GitHub API는 사용자 인증을 위해 액세스 토큰을 필요로 하므로, Authorization 필드에 토큰을 포함시킴. 
                // => 이롤 통해 GitHub는 해당 요청이 인증된 요청임을 인식함 (액세스 토큰은 scope에 적은 내용에 대해서만 허용해줌)
                headers: {
                    Authorization: `token ${access_token}`,
                }
            })
        ).json();
        // 2. 유저 이메일 받기
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`,{
                headers: {
                    Authorization: `token ${access_token}`,
                }
            })
        ).json();
        // 이메일에서 primary와 verified가 true인 이메일 찾기
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        // 만약 verified 된 email이 없다면
        if (!emailObj) {
            return res.redirect("/login");
        }
        // 만약 verified 된 email이 있다면 User에서 같은 이메일을 가진 유저를 찾음
        let user = await User.findOne({ email: emailObj.email });
       
        if (!user){
             // 같은 이메일을 가진 유저가 없다면 GitHub에서 가져온 데이터를 기반으로 회원가입을 시켜줌.
            user = await User.create({
                avatarUrl: userData.avatar_url,
                name: userData.name,
                username: userData.login,
                email: emailObj.email,
                password: "",
                socialOnly: true,
                location: userData.location,
            });
        }  
        // 같은 이메일을 가진 유저가 있다면, 로그인 시켜줌
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        // access_token이 없는 경우, 로그인 페이지로 리다이렉트 됨
        return res.redirect("/login");
    }
};


// 카카오 로그인 관련-----------------------------------------------------------------------------------------------------------------------------------------------
export const startKakaoLogin = (req, res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/authorize";
    const config = {
        client_id: process.env.REST_API_KEY,
        redirect_url: "http://localhost:4000/users/kakao/finish",
        response_type: "code",
    };

    // const params = new URLSearchParams(config).toString();
    // const finalUrl = `${baseUrl}?${params}`;
    // return res.redirect(finalUrl);

    return res.redirect(`${baseUrl}?response_type=${config.response_type}&client_id=${config.client_id}&redirect_uri=${config.redirect_url}`);
};

export const finishKakaoLogin = async (req, res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
        grant_type: "authorization_code",
        client_id: process.env.REST_API_KEY,
        redirect_url: "http://localhost:4000/users/kakao/finish",
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers:{
                Accept: "application/json",
            }
        })
    ).json();

    if("access_token" in tokenRequest){
        const { access_token } = tokenRequest;
        const apiUrl = "https://kapi.kakao.com/v2/user/me";
        const userData = await (
            await fetch(apiUrl,{
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            })
        ).json();

        const kakaoAccount = userData.kakao_account;
        const kakaoProfile = kakaoAccount.profile;
        
        if (kakaoAccount.is_email_valid === false || kakaoAccount.is_email_verified === false) {
            return res.redirect("/");
        }
        
        let user = await User.findOne({ email: kakaoAccount.email });
       
        if (!user){
            user = await User.create({
                avatarUrl: kakaoProfile.profile_image_url,
                name: kakaoProfile.nickname,
                username: kakaoProfile.nickname,
                email: kakaoAccount.email,
                password: "",
                socialOnly: true,
            });
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};





// 구글 로그인 관련------------------------------------------------------------------------------------------------------------------------------------------------
export const startGoogleLogin = (req, res) => {
    const baseUrl = "https://accounts.google.com/o/oauth2/auth";
    const config = {
        client_id: process.env.GOOGLE_CLIENT,
        redirect_uri: "http://localhost:4000/users/google/finish",
        response_type: "code",
        scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGoogleLogin = async (req, res) => {
    const baseUrl = "https://oauth2.googleapis.com/token";
    const config = {
        grant_type: "authorization_code",
        client_id: process.env.GOOGLE_CLIENT,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: req.query.code,
        redirect_uri: "http://localhost:4000/users/google/finish",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers:{
                Accept: "application/json",
            }
        })
    ).json();

    if("access_token" in tokenRequest){
        const { access_token } = tokenRequest;
        const apiUrl = `https://www.googleapis.com/oauth2/v1/userinfo`;
        const userData = await (
            await fetch(apiUrl,{
                headers: {
                    Authorization: `Bearer ${access_token}`,
                }
            })
        ).json();
        console.log(userData);
        
        if (userData.verified_email === false) {
            return res.redirect("/");
        }
        
        let user = await User.findOne({ email: userData.email });
       
        if (!user){
            user = await User.create({
                avatarUrl: userData.picture,
                name: userData.name,
                username: userData.name,
                email: userData.email,
                password: "",
                socialOnly: true,
            });
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};


// 네이버 로그인 관련------------------------------------------------------------------------------------------------------------------------------------------------
export const startNaverLogin = (req, res) => {
    const baseUrl = "https://nid.naver.com/oauth2.0/authorize";
    const config = {
        client_id: process.env.NAVER_CLIENT,
        redirect_uri: "http://localhost:4000/users/naver/finish",
        response_type: "code",
        state: process.env.STATE_STRING,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
    
};

export const finishNaverLogin = async (req, res) => {
    const baseUrl = "https://nid.naver.com/oauth2.0/token";
    const config = {
        grant_type: "authorization_code",
        client_id: process.env.NAVER_CLIENT,
        client_secret: process.env.NAVER_CLIENT_SECRET,
        code: req.query.code,
        state: req.query.state,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;

    const tokenRequest = await (
        await fetch(finalUrl, {
            method: "POST",
            headers:{
                Accept: "application/json",
            }
        })
    ).json(); 

    if("access_token" in tokenRequest){
        const { access_token, token_type } = tokenRequest;
        const apiUrl = `https://openapi.naver.com/v1/nid/me`;
        const userData = await (
            await fetch(apiUrl,{
                headers: {
                    Authorization: `${token_type} ${access_token}`,
                }
            })
        ).json();       

        const userDataResponse = userData.response;
        let user = await User.findOne({ email: userDataResponse.email });
       
        if (!user){
            user = await User.create({
                avatarUrl: userDataResponse.profile_image,
                name: userDataResponse.name,
                username: userDataResponse.name,
                email: userDataResponse.email,
                password: "",
                socialOnly: true,
            });
        } 
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};