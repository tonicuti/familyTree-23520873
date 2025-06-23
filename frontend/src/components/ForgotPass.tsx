import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgSign from "../assets/imgSign.png";

const ForgotPass: React.FC = () => {
	const [cccd, setCccd] = useState<string>("");
	const [phone, setphone] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!cccd || !phone) {
		setErrorMessage("*Vui lòng nhập đầy đủ mã CCCD và số điện thoại!");
		return;
		}

		try {
		const response = await fetch("http://127.0.0.1:8000/ForgotPass", {
			method: "POST",
			headers: {
			"Content-Type": "application/json",
			},
			body: JSON.stringify({ cccd, phone }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.detail || "Có lỗi xảy ra.");
		}

		alert("Mã OTP đã được gửi đến số điện thoại của bạn!");
		setErrorMessage("");
		navigate("/OTP", { state: { cccd } });
		} catch (error: any) {
		setErrorMessage("*" + error.message);
		}
	};

	const handleSignUp = () => {
		navigate("/SignUp");
	};

	const handleSignInClick = () => {
		navigate("/SignIn");
	}

	return (
		<div
		className="flex h-screen"
		style={{ background: "linear-gradient(to right, var(--color-p-300), var(--color-p-100))" }}
		>
		{/* Left image */}
		<div className="w-2/5 flex items-center justify-center">
			<img
			src={imgSign}
			alt=""
			className="w-[95%] h-[95%] object-cover rounded-3xl shadow-xl"
			/>
		</div>
		{/* Right form */}
		<div className="w-3/5 flex flex-col items-center justify-center relative">
			{/* "Bạn chưa có tài khoản?" on top right */}
			<div className="absolute top-8 right-12 flex items-center gap-2 z-10">
			<span className="text-gray-600 font-medium">Bạn chưa có tài khoản?</span>
			<button
				onClick={handleSignUp}
				className="text-[var(--color-p-400)] font-bold hover:underline transition cursor-pointer"
			>
				Đăng ký
			</button>
			</div>
			<div
			style={{ background: "var(--color-p-100)" }}
			className="p-8 rounded-xl w-full max-w-lg shadow-2xl"
			>
			<span
				style={{ color: "var(--color-p-400)" }}
				className="text-white text-4xl flex justify-center mb-6 drop-shadow-lg"
			>
				<i className="uiw--user-add"></i>
			</span>

			<h2
				style={{ color: "var(--color-p-400)" }}
				className="text-4xl font-bold text-center text-white mb-6 drop-shadow-xl"
			>
				Thay đổi mật khẩu
			</h2>

			<form onSubmit={handleSubmit} className="space-y-6 shadow-2xl p-6 rounded-xl">
				<div className="flex items-center space-x-4 p-2 rounded-xl">
				<span
					style={{ background: "var(--color-p-400)" }}
					className="text-white flex items-center justify-center rounded-xl w-20 h-16 shadow-lg drop-shadow-md"
				>
					<i className="bxs--user-account text-2xl"></i>
				</span>
				<input
					type="text"
					value={cccd}
					onChange={(e) => setCccd(e.target.value)}
					placeholder="Nhập mã CCCD"
					className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
					required
				/>
				</div>

				<div className="flex items-center space-x-4 p-2 rounded-xl">
					<span
						style={{ background: "var(--color-p-400)" }}
						className="text-white flex items-center justify-center rounded-xl w-20 h-16 shadow-lg drop-shadow-md"
					>
						<i className='ic--baseline-phone text-2xl'></i>
					</span>
					
					<input
						type="text"
						value={phone}
						onChange={(e) => setphone(e.target.value)}
						placeholder="Nhập số điện thoại"
						className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
						required
					/>
				</div>

				<button
				type="submit"
				style={{ background: "var(--color-p-400)" }}
				className="w-full text-white p-4 rounded-lg transition duration-200 text-[30px] font-bold leading-[1.2] flex justify-center items-center cursor-pointer shadow-xl drop-shadow-lg hover:var(--color-p-100)"
				>
				Nhận mã OTP
				</button>

				<div className="flex justify-end">
					<button
						type="button"
						style={{ color: "var(--color-p-400)" }}
						className="text-sm font-semibold hover:underline cursor-pointer"
						onClick={handleSignInClick}
					>
						Quay lại đăng nhập
					</button>
				</div>



				{errorMessage && (
				<p className="text-red-800 text-sm mt-2 text-center shadow-md drop-shadow-md">
					{errorMessage}
				</p>
				)}
			</form>
			</div>
		</div>
		</div>
	);
};

export default ForgotPass;