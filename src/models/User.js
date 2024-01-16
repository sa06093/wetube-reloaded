import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    socialOnly: { type: Boolean, default: false },
    username: { type: String, required: true },
    password: { type: String },
    name: { type: String, required: true },
    location: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video"}]
});

userSchema.pre('save', async function() {
    // 비밀번호가 변경되었을 때만 (영상 업로드 시 save 작동해 비밀번호 hashing되는 문제 해결)
    if(this.isModified("password")){
        //여기서 this는 userController에서 create되는 User을 가르킴
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model('User', userSchema);

export default User;