import { useState, useEffect, useRef } from "react";
import api from "../api.tsx";

const Info = () => {
  interface User {
    HoTen: string;
    GioiTinh: string;
    NgaySinh: string;
    QueQuan: string;
    CCCD: string;
    NgheNghiep: string;
    SDT: string;
    DiaChi: string;
    Avatar: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const fetchUser = async () => {
    const CCCD = localStorage.getItem("CCCD");
    if (!CCCD) return;

    try {
        const response = await fetch("http://127.0.0.1:8000/profiles/thong-tin-tai-khoan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ CCCD }),
        });

        const data = await response.json();
        if (data && typeof data === "object") {
            setUser(data);
            if (data.Avatar) {
                setAvatar(data.Avatar); // nếu backend trả URL avatar
            }
        }
    } catch (error) {
        console.error("Error fetching user:", error);
    }
    };


  useEffect(() => {
    fetchUser();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const imgUrl = URL.createObjectURL(file);
    setAvatar(imgUrl);

    const CCCD = localStorage.getItem("CCCD");
    if (!CCCD) return;

    try {
      const formData = new FormData();
      formData.append("CCCD", CCCD);
      formData.append("avatar", file);

      const response = await fetch("http://127.0.0.1:8000/profiles/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload avatar failed");
      }

      const result = await response.json();
      if (result.avatarUrl) {
        setAvatar(result.avatarUrl);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  const handleClickUpload = () => {
    console.log("Avatar URL:", avatar);
    inputFileRef.current?.click();
  };

  // Tăng size input bằng cách thêm text-base, py-3, px-4, w-full
  const InfoField = ({ label, value }: { label: string; value: string }) => (
    <div>
      <label className="block font-semibold text-[var(--color-p-400)]">{label}</label>
      <div className="w-full text-base py-3 px-4 border border-[var(--color-p-400)] rounded-lg text-gray-800 bg-gray-50">
        {value}
      </div>
    </div>
  );

  const getGioiTinh = (gender: string) => {
    const normalized = gender.toLowerCase();
    if (normalized === "nam") return "Nam";
    if (normalized === "nữ") return "Nữ";
    return gender;
  };

  return (
    <div className="min-h-screen bg-white pl-[260px]">
      <div className="w-full max-w-2xl mx-auto mt-14 ml-14 p-6 flex flex-col items-center">
        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 ml-6">
            <h1 className="text-4xl font-bold text-[var(--color-p-400)] mb-10 text-center">
              Thông tin tài khoản
            </h1>
            {user ? (
              <form className="grid grid-cols-2 gap-x-6 gap-y-6">
                <InfoField label="Họ và tên" value={user.HoTen} />
                <InfoField label="Mã CCCD" value={user.CCCD} />
                <InfoField label="Giới tính" value={getGioiTinh(user.GioiTinh)} />
                <InfoField
                  label="Ngày sinh"
                  value={new Date(user.NgaySinh).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                />
                <InfoField label="Quê quán" value={user.QueQuan} />
                <InfoField label="Nghề nghiệp" value={user.NgheNghiep} />
                <InfoField label="Số điện thoại" value={user.SDT} />
                <div className="col-span-2">
                  <InfoField label="Địa chỉ" value={user.DiaChi} />
                </div>
              </form>
            ) : (
              <p className="text-center text-gray-500">Đang tải thông tin người dùng...</p>
            )}
          </div>

            {/* avatar */}
          <div className="flex flex-col items-center mt-10">
            <div
              className="relative w-32 h-32 flex items-center justify-center rounded-full bg-[var(--color-p-300)] cursor-pointer overflow-hidden"
              onClick={handleClickUpload}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="solar--user-outline text-white text-4xl"></i>
              )}
            </div>
            <p
              className="mt-3 text-[var(--color-p-400)] text-sm cursor-pointer hover:underline transition duration-200 font-semibold"
              onClick={handleClickUpload}
            >
              Cập nhật ảnh đại diện
            </p>
            <input
              type="file"
              accept="image/*"
              ref={inputFileRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;