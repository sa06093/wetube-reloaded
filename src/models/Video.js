import mongoose from "mongoose";

// model 생성 전에 model의 형태(생김새) 정의
const videoSchema = new mongoose.Schema({
    // createdAt과 meta데이터는 사용자에게 자동으로 제공해줌
    title: { type: String, required: true, trim: true, maxLength: 80 }, // min, max는 여기(database)와 pug 파일에서 둘 다 설정해줘야함
    fileUrl: {type: String, required: true },
    thumbUrl: { type: String, required: true },
    description: { type: String, required: true, trim: true, minLength: 20 },
    createdAt: { type: Date, required: true , default: Date.now },  // Date.now()를 하지 않는 이유는 바로 실행시키고 싶지 않아서
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
        rating: { type: Number, default: 0, required: true },
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment" }],
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }
});

videoSchema.static('formatHashtags', function(hashtags) {
    return hashtags.split(",").map((word) => (word.startsWith('#') ? word : `#${word}`));
});

// Video model 완성
const Video = mongoose.model("Video", videoSchema);

export default Video;