import { useState } from "react";
import Logo from "../assets/Logo.png";
import api from "../api.tsx";
import { useNavigate } from "react-router-dom";

const provinces = [
	"Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
	"An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
	"Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
	"Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
	"Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
	"Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
	"Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
	"Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
	"Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
	"Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
	"Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
	"Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
	"Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const SignUp = () => {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		HoTen: "",
		CCCD: "",
		GioiTinh: "",
		NgaySinh: "",
		QueQuan: "",
		NgheNghiep: "",
		SDT: "",
		DiaChi: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);

	const handleSignIn = () => navigate("/SignIn");

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

const handleSubmit = async (e: React.FormEvent) => {
	e.preventDefault();
	setLoading(true);

  if (formData.SDT && !/^\d{10}$/.test(formData.SDT)) {
    alert("Số điện thoại phải có đúng 10 chữ số.");
    setLoading(false);
    return;
  }
  
	try {
		const response = await fetch("http://127.0.0.1:8000/SignUp", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
		});

		if (response.ok) {
		alert("Đăng ký thành công!");
		navigate("/SignIn");
		} else {
		// Cố gắng lấy thông báo lỗi chi tiết từ backend (nếu có)
		let errorMsg = "Đăng ký thất bại.";
		try {
			const data = await response.json();
			if (typeof data.detail === "string") {
			errorMsg = data.detail;
			} else if (Array.isArray(data.detail)) {
			errorMsg = data.detail
				.map((d) =>
				typeof d === "string" ? d : JSON.stringify(d)
				)
				.join("\n");
			} else if (typeof data.detail === "object" && data.detail !== null) {
			errorMsg = JSON.stringify(data.detail);
			}
		} catch {
			// Nếu backend trả về lỗi không phải JSON
			errorMsg = await response.text();
		}

		alert(errorMsg);
		}
	} catch (error) {
		alert("Lỗi kết nối đến server");
		console.error(error);
	} finally {
		setLoading(false);
	}
};

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, var(--color-p-100) 0%, var(--color-p-300) 50%, var(--color-p-400) 100%)",
      }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl border border-[var(--color-p-400)]">
        <div className="flex justify-center mb-8">
          <img src={Logo} alt="Logo" className="w-28 drop-shadow" />
        </div>

        <h2 className="text-center text-2xl font-bold text-[var(--color-p-400)] mb-5">
          Tạo tài khoản mới
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Họ và tên<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="HoTen"
              placeholder="Nhập họ tên"
              value={formData.HoTen}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
              required
            />
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              CCCD<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="CCCD"
              placeholder="Nhập số CCCD"
              value={formData.CCCD}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
              required
            />
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Giới tính<span className="text-red-500">*</span>
            </label>
            <select
              name="GioiTinh"
              value={formData.GioiTinh}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
            >
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Ngày sinh<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="NgaySinh"
              value={formData.NgaySinh}
              onChange={handleChange}
              placeholder="dd/mm/yyyy"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
            />
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Quê quán<span className="text-red-500">*</span>
            </label>
            <select
              name="QueQuan"
              value={formData.QueQuan}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
            >
              <option value="">Chọn tỉnh/thành</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Nghề nghiệp
            </label>
            <input
              type="text"
              name="NgheNghiep"
              placeholder="Ví dụ: Sinh viên, Kỹ sư..."
              value={formData.NgheNghiep}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
            />
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Số điện thoại
            </label>
            <input
              type="text"
              name="SDT"
              placeholder="Nhập số điện thoại"
              value={formData.SDT}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
            />
          </div>

          <div>
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              name="DiaChi"
              placeholder="Nhập địa chỉ liên hệ"
              value={formData.DiaChi}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[var(--color-p-400)] font-medium mb-1">
              Mật khẩu<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring focus:ring-[var(--color-p-300)] focus:border-[var(--color-p-400)] transition"
              required
            />
          </div>

          <p className="text-sm text-red-500 md:col-span-2 mt-2 italic">
            * Thông tin bắt buộc
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`md:col-span-2 w-full py-3 mt-2 font-semibold rounded-lg transition 
              bg-[var(--color-p-300)] text-white shadow-lg 
              hover:bg-[var(--color-p-400)] hover:text-white cursor-pointer
              ${loading ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {loading ? "Đang đăng ký..." : "ĐĂNG KÝ"}
          </button>

          <div className="md:col-span-2 flex justify-center mt-2">
            <span
              className="cursor-pointer text-[var(--color-p-400)] hover:underline font-medium"
              onClick={handleSignIn}
            >
              Bạn đã có tài khoản?
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;