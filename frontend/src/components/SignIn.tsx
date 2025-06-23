import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgSign from "../assets/imgSign.png";  
import api from "../api.tsx";

const SignIn = () => {
	const navigate = useNavigate();
	const [CCCD, setCCCD] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage("");
		setLoading(true);
		try {
			const response = await api.post('/SignIn', { CCCD, password });
			const userObj = response.data;
			if (userObj && userObj.user && userObj.user.id) {
				localStorage.setItem('CCCD', CCCD);
				localStorage.setItem('user', JSON.stringify(userObj));
				localStorage.setItem('id_user', userObj.user.id.toString());
			} else {
				// Nếu không có id_user, xóa localStorage (tránh nhầm lẫn)
				localStorage.removeItem('id_user');
				localStorage.removeItem('user');
				localStorage.removeItem('CCCD');
			}
			navigate('/profiles/main');
		} catch (error: any) {
		if (error.response && error.response.status === 401) {
			setErrorMessage('CCCD hoặc mật khẩu không đúng!');
		} else {
			setErrorMessage('Có lỗi xảy ra, vui lòng thử lại sau!');
		}
		} finally {
		setLoading(false);
		}
	};

	const handleForgotPassClick = () => {
		navigate('/ForgotPass');
	};

	const handleSignUp = () => {
		navigate('/SignUp');
	};

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
				Người dùng đăng nhập
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
					value={CCCD}
					onChange={(e) => setCCCD(e.target.value)}
					placeholder="Nhập mã CCCD"
					className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
					required
				/>
				</div>
				<div className="flex items-center space-x-4 p-2 rounded-xl">
				<span
					style={{ background: "var(--color-p-400)" }}
					className="text-white bg-amber-600 flex items-center justify-center rounded-xl w-20 h-16 shadow-lg drop-shadow-md"
				>
					<i className="teenyicons--password-solid text-2xl"></i>
				</span>
				<input
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder="Nhập mật khẩu"
					className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-xl font-semibold text-gray-900 shadow-inner"
					required
				/>
				</div>

				<button
				type="submit"
				style={{ background: "var(--color-p-400)" }}
				className="w-full text-white p-4 rounded-lg transition duration-200 text-[30px] font-bold leading-[1.2] flex justify-center items-center cursor-pointer shadow-xl drop-shadow-lg hover:var(--color-p-100)"
				disabled={loading}
				>
				{loading ? "Đang đăng nhập..." : "Đăng nhập"}
				</button>

				<div className="flex justify-end">
				<button
					type="button"
					style={{ color: "var(--color-p-400)" }}
					className="text-sm font-semibold hover:underline cursor-pointer"
					onClick={handleForgotPassClick}
				>
					Quên mật khẩu?
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

export default SignIn;