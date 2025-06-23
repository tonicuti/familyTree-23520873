# Family Tree Web Application

Ứng dụng **quản lý cây gia phả (Family Tree)** bao gồm **Frontend** và **Backend**:

* **Frontend**: TypeScript + Vite + TailwindCSS
* **Backend**: FastAPI (Python)

---

## Công nghệ sử dụng

| Phần         | Công nghệ chính                        |
| ------------ | -------------------------------------- |
| **Frontend** | TypeScript, React, Vite, TailwindCSS   |
| **Backend**  | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **Khác**     | dotenv, passlib, httpx, unidecode      |

---

## Cài đặt thư viện

### Backend (Python)

Các thư viện cần thiết đã được liệt kê trong **`requirement.txt`**.

Cài đặt:

```bash
pip install -r requirement.txt
```

### ✅ Frontend (Node.js)

Các thư viện cần thiết đã được liệt kê trong **`requirement-fe.txt`**.

Cài đặt:

```bash
npm install -r requirement-fe.txt
```

Yêu cầu đã cài Node.js: [https://nodejs.org/](https://nodejs.org/)

```bash
cd frontend
npm install
```

---

## ▶️ Hướng dẫn chạy dự án

### 1️⃣ Chạy Backend (FastAPI)

```bash
uvicorn main:app --reload
```

* Truy cập API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Tài liệu API: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 2️⃣ Chạy Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

* Mặc định chạy ở: [http://localhost:5173](http://localhost:5173)

---

## 📁 Cấu trúc thư mục

```
family-tree/
├── backend/         # Source code FastAPI
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── ...
├── frontend/        # Source code React + TypeScript + TailwindCSS
│   └── ...
├── requirement.txt # Thư viện Backend cần cài
|__ requirement-fe.txt # Thư viện Frontend cần cài
└── README.md        # Tài liệu dự án
```

---

## Ghi chú

* ⚙**Chạy Backend trước → Frontend sau.**
* **Thông tin cấu hình nhạy cảm (nếu có) cần đặt trong file `venv`.**

---

## ✨ Một số tính năng chính

* Thêm, xóa thành viên gia đình
* Quản lý mối quan hệ: cha, mẹ, con
* Tra cứu, tìm kiếm thành viên
* Thống kê, báo cáo sự kiện (sinh, mất, kết hôn, thành tích)

---
