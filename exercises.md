# Phiếu Phản Ánh — K4 Level 3B, Ngày 12

> **Bài làm cá nhân.** Trả lời bằng lời của chính bạn, dựa trên những gì bạn
> quan sát được khi chạy code — không sao chép đáp án của người khác.
>
> Cách trả lời: thay nội dung mẫu sau mỗi câu bằng câu trả lời.
> `grade.py` đếm số câu đã trả lời (15 điểm cho 10 câu).
>
> Họ và tên: Nguyễn Hoàng Cường Mã học viên: 2A202602473

---

### Câu 1 — Fail fast (CP1)

Trong `Settings`, `agent_api_key` không có giá trị mặc định nên app chết ngay
khi khởi động nếu thiếu biến môi trường. Hãy mô tả một tình huống cụ thể mà
việc "chết sớm" này cứu bạn, so với việc để mặc định `"changeme"`.

> Ví dụ: em deploy lên Railway nhưng quên cấu hình AGENT_API_KEY. Vì trường này bắt buộc và không có giá trị mặc định, app dừng ngay lúc khởi động nên em thấy lỗi ở build/start log, trước khi mở endpoint cho người khác. Nếu mặc định là changeme thì app vẫn chạy và có thể vô tình chấp nhận một khóa công khai, khiến người khác gọi API và phát sinh chi phí.

---

### Câu 2 — Log cho máy đọc (CP1)

Chạy service và gọi `/ask` vài lần. Dán một dòng log JSON bạn thu được, rồi
nêu **hai** việc bạn làm được với dòng log đó mà `print("đã trả lời xong")`
không làm được.

> Log em ghi nhận khi gọi /ask thành công:
> {"event":"ask_completed","level":"info","timestamp":"2026-09-29T03:49:31.988194+00:00","user_id":"cp5-local-check","tokens_in":4,"tokens_out":36,"cost_usd":2.22e-05}
> Từ các trường này, em có thể lọc các lần gọi theo event hoặc user_id để điều tra một request; đồng thời cộng tokens và cost theo thời gian để theo dõi mức sử dụng. Một dòng print cố định không có các trường đó để lọc hoặc tổng hợp.

---

### Câu 3 — Kích thước image (CP2)

Build cả hai phiên bản và ghi lại số đo thật:

```bash
docker build -f <Dockerfile-1-stage> -t agent:single .
docker build -t agent:multi .
docker images | grep agent
```

| Bản | Dung lượng |
|-----|-----------|
| 1 stage (bản đầu) | ... MB |
| Multi-stage | ... MB |

Giải thích: phần dung lượng chênh lệch đó là những gì?

> Em chưa có số đo MB để ghi: Docker build không hoàn tất vì lần tải layer Python từ Docker Hub dừng ở 10.49/29.83 MB, nên em không điền số ước đoán cho image một stage hay multi-stage. Về nguyên tắc, multi-stage chỉ chép dependency runtime sang image cuối, bỏ lại công cụ build và file trung gian nên thường nhỏ hơn. Cần tải xong base image, build được cả hai phiên bản rồi ghi số từ docker images để kết luận bằng số liệu thật.

---

### Câu 4 — Thứ tự lệnh trong Dockerfile (CP2)

Sửa một ký tự trong `app/main.py` rồi build lại. Với Dockerfile của bạn, những
layer nào được dùng lại từ cache, layer nào phải chạy lại? Nếu bạn đặt
`COPY . .` lên trước `RUN pip install` thì kết quả khác thế nào?

> Dockerfile hiện chép requirements.txt rồi cài thư viện trước khi chép app và utils. Khi chỉ sửa app/main.py, layer cài dependency vẫn dùng lại nếu requirements.txt không đổi; các layer từ COPY source trở đi được build lại. Nếu COPY . . đặt trước pip install thì sửa một file source cũng làm layer COPY đổi, khiến pip install phía sau phải chạy lại và build chậm hơn. Em chưa quan sát được rebuild hoàn chỉnh vì base image chưa tải xong.

---

### Câu 5 — Vì sao không chạy bằng root (CP2)

Container mặc định chạy bằng root. Mô tả chuỗi sự kiện dẫn từ "một lỗ hổng
trong code Python của bạn" tới "kẻ tấn công có quyền cao trên máy host", và
lệnh `USER` cắt đứt chuỗi đó ở chỗ nào.

> Nếu app bị khai thác để chạy lệnh tùy ý, tiến trình root có thể sửa file trong container, đọc dữ liệu được mount và dùng quyền cao hơn khi cấu hình container hoặc host có lỗ hổng. USER appuser giới hạn quyền của tiến trình ứng dụng, nên kể cả khi bị chiếm, attacker không có quyền root trong container để tiếp tục chuỗi tấn công. Đây là giảm tác động, không thay thế việc vá lỗi và cô lập container.

---

### Câu 6 — Cửa sổ trượt (CP3)

Rate limit của bạn dùng sliding window 60 giây. Nếu thay bằng cách đếm theo
phút đồng hồ (reset lúc giây 00), một người dùng có thể gửi tối đa bao nhiêu
request trong 2 giây liên tiếp khi hạn mức là 10/phút? Giải thích cách đạt được
con số đó.

> Với bộ đếm reset đầu mỗi phút, em có thể gửi 10 request ở giây 59 rồi thêm 10 request ngay giây 00 của phút kế tiếp. Hai nhóm nằm trong hai cửa sổ đếm khác nhau nên có thể nhận tổng cộng 20 request trong khoảng hai giây.

---

### Câu 7 — Rate limit và cost guard (CP3)

Hai cơ chế này khác nhau ở điểm nào? Cho một tình huống mà rate limit cho qua
nhưng cost guard phải chặn, và một tình huống ngược lại.

> Rate limit giới hạn số request trong một khoảng thời gian; cost guard giới hạn tổng tiền đã tiêu trong tháng. Một user vẫn dưới 10 request/phút nhưng gửi prompt rất tốn token nhiều lần thì rate limit cho qua, còn cost guard chặn khi vượt ngân sách. Ngược lại, nhiều request rất nhỏ có thể chưa hết ngân sách nhưng vẫn vượt số request/phút và bị rate limit chặn.

---

### Câu 8 — /health khác /ready (CP4)

Nếu gộp hai endpoint làm một và cho nó kiểm tra Redis, chuyện gì xảy ra với cụm
3 container khi Redis mất kết nối 30 giây? Trả lời theo đúng thứ tự sự kiện.

> Nếu gộp readiness vào liveness, Redis mất kết nối thì thứ tự có thể là: cả 3 container báo unhealthy; orchestrator lần lượt restart cả 3; Redis vẫn đang lỗi nên các instance mới lại unhealthy; service có thể mất toàn bộ capacity dù process còn chạy. /health chỉ kiểm tra process để quyết định restart; /ready kiểm tra Redis để load balancer tạm ngừng gửi traffic tới instance chưa sẵn sàng.

---

### Câu 9 — Stateless (CP4)

Chạy `docker compose up --scale agent=3` rồi gọi `/ask` nhiều lần với cùng một
`X-User-Id`. Quan sát `history_length` trong response. Nếu lịch sử được lưu
trong một dict Python thay vì Redis, bạn sẽ thấy con số đó thay đổi thế nào?

> Trong một process local em thấy history_length ban đầu bằng 0; lần gọi kế tiếp dùng history đã lưu. Chưa chạy được Compose scale=3 vì Docker image chưa build xong nên đây chưa phải quan sát qua ba container. Với Redis dùng chung, request tới instance nào cũng đọc cùng lịch sử và số history_length tăng nhất quán (mỗi lượt thêm user và assistant). Nếu thay bằng dict trong RAM, từng container có bản sao riêng; khi load balancer đổi instance, lịch sử nhìn thấy sẽ thiếu hoặc số đếm thay đổi theo instance.

---

### Câu 10 — Deploy thật (CP5)

Ghi lại **một** lỗi bạn gặp khi deploy lên cloud (build fail, health check
timeout, sai REDIS_URL, app không đọc `$PORT`...): thông báo lỗi là gì, bạn
tìm ra nguyên nhân bằng cách nào, và sửa ra sao?

> Em chưa deploy lên cloud nên không có lỗi cloud nào để ghi lại. Lỗi thực tế em gặp là trước bước deploy: Docker build bị kẹt khi tải layer Python từ Docker Hub ở 10.49/29.83 MB, nên chưa xác minh được image/Compose. Em xác định đây là lỗi tải base image từ output của build; cách khắc phục là thử lại khi Docker Hub tải ổn, xác nhận build hoàn tất rồi mới deploy. Cần deploy thật mới có thể ghi một lỗi cloud và cách sửa dựa trên log của nền tảng.
