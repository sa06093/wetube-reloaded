import User from "../models/User";
import bcrypt from "bcrypt";

// Join 관련-----------------------------------------------------------------------------------------------------------------------------------------------------
export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });

export const postJoin = async (req, res) => {
    const {name, username, email, password, password2, location } = req.body;
    const pageTitle = "Join";
    // password가 confirm password와 일치하는지 확인
    if (password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Password confirmation does not match."
        });
    }

    // 중복된 username 발견 시, join창으로 다시 돌리고, 에러메시지 보내줌
    const exists = await User.exists({$or: [{ username }, { email }]});
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "This username/email is already taken"
        });
    }
    
    try {
        await User.create({
            avatarUrl: 'http://k.kakaocdn.net/dn/1G9kp/btsAot8liOn/8CWudi3uy07rvFNUkk3ER0/img_640x640.jpg',
            name,
            username,
            email,
            password,
            location,
        });
        res.redirect("/login");
    } catch(error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

// 로그인 관련----------------------------------------------------------------------------------------------------------------------------------------------------
export const getLogin = (req, res) => res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
    // username이 database에 있는지 확인
    const { username, password } = req.body;
    const pageTitle = "Login";
    // socal로 로그인한 계정은 제외함
    const user = await User.findOne({ username, socialOnly: false });  // 어차피 password 부분에서 직접 찾아야해서 exist 안씀
    if(!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists."
        });
    }
    // password가 일치하는지 확인
    const ok = await bcrypt.compare(password, user.password);
    // 만약 일치하지 않는다면
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password"
        });
    }
    // 일치한다면, 유저에 대한 정보를 세션에 담음(세션이 수정되는 곳)
    req.session.loggedIn = true;    // 로그인 완료했다는 정보를 담음
    req.session.user = user;    // DB에서 찾은 user을 세션에 저장
    return res.redirect("/");
};


// 로그아웃 관련----------------------------------------------------------------------------------------------------------------------------------------------------
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

// 계정 edit 관련---------------------------------------------------------------------------------------------------------------------------------------------------
export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
};

export const postEdit = async (req, res) => {
    // const id = req.session.user.id와 동일
    const {
        session: {
            user: { _id, avatarUrl },
        },
        body: { name, email, username, location },
        file,
    } = req;

    // 만약 username과 email이 User에 이미 있다면 에러메시지 출력
    const findUsername = await User.findOne({ username });
    const findEmail = await User.findOne({ email });
    // 서버에 있는 username의 id값과 지금 나의 id값이 다른 경우, 동일한 username으로 다른 id값이 있다는 것이므로, 중복된다는 것이다.
    if (findUsername._id != _id || findEmail._id != _id) {
        return res.render("edit-profile", {
            pageTitle: "Edit Profile",
            errorMessage: "User is already exist",
        }); 
    }

    // username과 email이 없다면, 여기서 찾은 id값 기반으로 database 업데이트 시켜주기
    const updateUser = await User.findByIdAndUpdate(
        _id,
        {
            // file이 존재하지 않는다면, 기존 avatarUrl 값 유지
            avatarUrl: file ? file.path : avatarUrl,
            name,
            email,
            username,
            location,
        },
        { new: true },  // 업데이트된 문서 반환
    );
    // 로그인 이후로, db만 업데이트 되고 세션은 업데이트 되지 않았기 때문에, 세션도 업데이트 해줌
    req.session.user = updateUser;
        
    return res.redirect(`/users/${_id}`);
};

// 비밀번호 변경하는 부분----------------------------------------------------------------------------------------------------------------------------------------------------------
export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly === true) {
        req.flash("error", "Can't change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle: "Change Password"});
};

export const postChangePassword = async (req, res) => {
    const {
      session: {
        user: { _id },
      },
      body: { oldPassword, newPassword, newPasswordConfirm },
    } = req;
    const user = await User.findById(_id);

    // DB의 비밀번호와 입력한 oldPassword 비교
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return res.status(400).render("users/change-password", {
        pageTitle: "Change Password",
        errorMessage: "The current password is incorrect",
      });
    }
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).render("users/change-password", {
        pageTitle: "Change Password",
        errorMessage: "The password does not match the confirmation",
      });
    }
    user.password = newPassword;    // db 데이터 변경
    await user.save();  // 변경한 db 데이터 저장(해싱 포함)
    req.flash("info", "Password Updated!");
    return res.redirect("/users/logout");   // 여기서 세션 없어짐 (굳이 세션 업데이트 안해도 됨)
  };


// My profile 관련------------------------------------------------------------------------------------------------------------------------------------------------------------
export const see = async (req, res) => {
    // 페이지를 누구나 볼 수 있어야 하니까 ID를 session에서 안가져오고 Url에서 가져옴
    const { id } = req.params;
    
    // url에 있는 ID를 가지고 user을 찾음
    const user = await User.findById(id).populate({
        path: "videos",
        populate: {
          path: "owner",
          model: "User",
        },
      });

    // 만약 user이 없다면
    if(!user) {
        return res.status(404).render("404", { pageTitle: "User not found." });
    }

    return res.render("users/profile", {
        pageTitle: user.name,
        user,
    });
};