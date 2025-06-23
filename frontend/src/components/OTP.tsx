import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import imgSign from "../assets/imgSign.png";  


const OTP: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const cccd = location.state?.cccd;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      setErrorMessage("*Vui lòng nhập mã OTP!");
      return;
    }

    if (!cccd) {
      setErrorMessage("*Thiếu thông tin CCCD. Vui lòng quay lại.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/OTP", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cccd, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Xác minh OTP thất bại.");
      }

      alert("Xác thực OTP thành công!");
      setErrorMessage("");
      navigate("/ChangePass", { state: { cccd } });
    } catch (error: any) {
      setErrorMessage("*" + error.message);
    }
  };

  const handleResendOTP = () => {
    alert("Mã OTP mới đã được gửi!");
    setErrorMessage("");
  };

  return (
    <div className="flex h-screen">
        <div className="w-2/5 bg-cover bg-center relative">
            <img src={imgSign} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 shadow-lg"></div>
        </div>

        <div
            style={{ background: "linear-gradient(to right, var(--color-p-300), var(--color-p-100))" }}
            className="w-3/5 flex items-center justify-center"
        >
            <div 
                style={{background: "var(--color-p-100)"}}
                className="p-8 rounded-xl w-full max-w-lg shadow-2xl bg-white"
            >
            <span className="text-4xl flex justify-center mb-6 text-[var(--color-p-400)] drop-shadow-lg">
                <i className="material-symbols--sms"></i>
            </span>

            <h2 className="text-4xl font-bold text-center mb-6 text-[var(--color-p-400)] drop-shadow-xl">
                Xác nhận OTP
            </h2>

            <p className="text-center mb-4 text-lg text-gray-700">
                Mã OTP đã được gửi qua số điện thoại của bạn. <br />
                Vui lòng kiểm tra tin nhắn!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 shadow-2xl p-6 rounded-xl">
                <div className="flex items-center space-x-4 p-2">
                <span className="flex items-center justify-center rounded-xl w-20 h-16 bg-[var(--color-p-400)] text-white shadow-lg drop-shadow-md">
                    <i className="material-symbols--sms text-2xl"></i>
                </span>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập mã OTP"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
                    required
                />
                </div>

                <button
                type="submit"
                className="w-full bg-[var(--color-p-400)] text-white p-4 rounded-lg transition duration-200 text-[30px] font-bold leading-[1.2] flex justify-center items-center cursor-pointer shadow-xl drop-shadow-lg"
                >
                Xác Nhận
                </button>

                {errorMessage && (
                <p className="text-red-800 text-sm mt-2 text-center shadow-md drop-shadow-md">
                    {errorMessage}
                </p>
                )}
            </form>

            <p
                onClick={handleResendOTP}
                className="text-center text-[var(--color-p-400)] cursor-pointer mt-4 hover:underline drop-shadow-md"
            >
                Gửi lại mã
            </p>
            </div>
        </div>
        </div>

  );
};

export default OTP;
