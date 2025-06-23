import { useState } from "react";

const GhiNhanKetThuc: React.FC = () => {
    const [formData, setFormData] = useState({
        HoTen: "",
        NgayMat: "",
        TenNguyenNhan: "",
        TenDiaDiemMaiTang: "",
        CCCD: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.HoTen.trim() || !formData.CCCD.trim() || !formData.NgayMat || !formData.TenNguyenNhan.trim() || !formData.TenDiaDiemMaiTang.trim()) {
            alert("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
            return;
        }

        // Kiểm tra CCCD phải đúng 12 số (nếu cần)
        if (!/^\d{12}$/.test(formData.CCCD.trim())) {
            alert("CCCD phải gồm đúng 12 chữ số.");
            return;
        }

        const userIdRaw = localStorage.getItem('id_user');
        console.log('userIdRaw:', userIdRaw, 'typeof:', typeof userIdRaw);
        const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;
        console.log('userId sử dụng:', userId, 'typeof:', typeof userId);

        try {
            const response = await fetch("http://127.0.0.1:8000/profiles/ghi-nhan-ket-thuc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-user-id': userId.toString()
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(`Lỗi: ${result.detail || "Không xác định"}`);
                return;
            }

            alert("Ghi nhận kết thúc thành công!");
            setFormData({
                HoTen: "",
                NgayMat: "",
                TenNguyenNhan: "",
                TenDiaDiemMaiTang: "",
                CCCD: ""
            });
        } catch (error) {
            console.error("Error:", error);
            alert("Đã xảy ra lỗi khi gửi dữ liệu.");
        }
    };

    // Giả sử sidebar là 260px, hãy đổi nếu sidebar của bạn khác chiều rộng này
    return (
        <div className="min-h-screen bg-white pl-[260px]">
            <div className="w-full max-w-2xl mx-auto mt-14 ml-14 p-6 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-[var(--color-p-400)] mb-10 text-center">
                    Ghi nhận kết thúc
                </h1>

                <form 
                    onSubmit={handleSubmit}
                    className="grid grid-cols-2 gap-x-6 gap-y-6 w-full"
                >
                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">Họ và tên*</label>
                        <input
                            type="text"
                            name="HoTen"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={formData.HoTen}
                            onChange={handleChange}
                        />
                        
                    </div>

                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">CCCD*</label>
                        <input
                            type="text"
                            name="CCCD"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={formData.CCCD}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">Ngày mất*</label>
                        <input
                            type="date"
                            name="NgayMat"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={formData.NgayMat}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">Nguyên nhân*</label>
                        <input
                            name="TenNguyenNhan"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-md"
                            value={formData.TenNguyenNhan}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">Địa điểm mai táng*</label>
                        <input
                            type="text"
                            name="TenDiaDiemMaiTang"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={formData.TenDiaDiemMaiTang}
                            onChange={handleChange}
                        />
                    </div>

                    <p className="text-sm text-red-600 col-span-2">*Thông tin bắt buộc</p>

                    <div className="col-span-2 flex justify-center mt-6">
                        <button
                            type="submit"
                            className="w-60 bg-[var(--color-p-400)] text-white text-xl font-semibold py-3 rounded-md hover:brightness-110 transition cursor-pointer"
                        >
                            Ghi nhận
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GhiNhanKetThuc;