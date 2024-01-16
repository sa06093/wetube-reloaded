# Wetube Reloaded

<!-- Global router -->
/ -> Home
/join -> Join
/login -> Login
/search -> Search

<!-- user router -->
/users/:id -> See User
/users/logout -> Log Out
/users/edit -> Edit My Profile
/users/delete -> Delete My Profile

<!-- video router -->
/videos/:id -> See Video
/videos/:id/upload -> Upload Video
/videos/:id/edit -> Edit Video
/videos/:id/remove -> Remove Video

/videos/comments -> Comment on a Video
/videos/comments/delete -> Delete A Comment of a Video


# Mongo 사용법
1. 몽고 사용하기
> mongo

2. 내가 가진 db 보기
> show dbs

3. 현재 사용 중인 db 확인
> db

4. 사용할 db 선택하기
> use dbName
(현재 수업에서는 `use wetube`)

5. db 컬렉션 보기
> show collections

6. db 컬렉션 안에 documents 보기
> db.collectionName.find()
(현재 수업에서는 `db.videos.find()`)

7. db 컬렉션 안에 documents 내용 모두 제거하기
> db.collectionName.remove({})
(현재 수업에서는 `db.videos.remove({})`)