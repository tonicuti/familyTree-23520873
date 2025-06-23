import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import imgSign from "../assets/imgSign.png";  

const ChangePass: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();

  const cccd = location.state?.cccd || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận không khớp. Vui lòng thử lại!");
      return;
    }

    if (!cccd) {
      setErrorMessage("Thiếu mã CCCD. Vui lòng quay lại bước xác thực OTP.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/ChangePass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cccd, new_password: newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Đổi mật khẩu thất bại.");
      }

      alert("Đổi mật khẩu thành công!");
      setErrorMessage("");
      navigate("/SignIn");
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex h-screen">
        {/* Hình ảnh nền */}
        <div className="w-2/5 bg-cover bg-center relative">
            <img src={imgSign} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 shadow-md"></div>
        </div>

        {/* Phần nội dung */}
        <div
            style={{ background: "linear-gradient(to right, var(--color-p-300), var(--color-p-100))" }}
            className="w-3/5 flex items-center justify-center"
        >
            <div 
                style = {{background: "var(--color-p-100"}}
                className="p-8 rounded-xl w-full max-w-lg shadow-2xl"
            >
            {/* Icon */}
            <span className="text-4xl flex justify-center mb-6 text-[var(--color-p-400)] drop-shadow-lg">
                <i className="material-symbols--lock-reset"></i>
            </span>

            {/* Tiêu đề */}
            <h2 className="text-4xl font-bold text-center mb-6 text-[var(--color-p-400)] drop-shadow-xl">
                Thay đổi mật khẩu
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 shadow-2xl p-6 rounded-xl">
                {/* CCCD Input */}
                <div className="flex items-center space-x-4 p-2 rounded-xl">
                    <span className="flex items-center justify-center rounded-xl w-20 h-16 bg-[var(--color-p-400)] text-white shadow-lg drop-shadow-md">
                        <i className="bxs--user-account text-2xl"></i>
                    </span>
                    <input
                        type="text"
                        value={cccd}
                        readOnly
                        className="w-full p-4 border border-gray-300 rounded-lg bg-gray-100 text-xl font-semibold text-gray-900 shadow-inner"
                    />
                </div>

                {/* Mật khẩu mới */}
                <div className="flex items-center space-x-4 p-2">
                <span className="flex items-center justify-center rounded-xl w-20 h-16 bg-[var(--color-p-400)] text-white shadow-lg drop-shadow-md">
                    <i className="teenyicons--password-solid text-2xl"></i>
                </span>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
                    required
                />
                </div>

                {/* Xác nhận mật khẩu mới */}
                <div className="flex items-center space-x-4 p-2">
                <span className="flex items-center justify-center rounded-xl w-20 h-16 bg-[var(--color-p-400)] text-white shadow-lg drop-shadow-md">
                    <i className="teenyicons--password-solid text-2xl"></i>
                </span>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Xác nhận mật khẩu mới"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
                    required
                />
                </div>

                {/* Error Message */}
                {errorMessage && (
                <p className="text-red-800 text-sm mt-2 text-center shadow-md drop-shadow-md">
                    {errorMessage}
                </p>
                )}

                {/* Submit Button */}
                <button
                type="submit"
                className="w-full bg-[var(--color-p-400)] text-white p-4 rounded-lg transition duration-200 text-[30px] font-bold leading-[1.2] flex justify-center items-center cursor-pointer shadow-xl drop-shadow-lg"
                >
                Xác nhận đổi mật khẩu
                </button>
            </form>
            </div>
        </div>
        </div>

  );
};

export default ChangePass;
