import { useState } from "react";

const ThemThanhTich = () => {
    const [formData, setFormData] = useState({
        HoTen: "",
        TenThanhTich: "",
        NgayPhatSinh: "",
        CCCD: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        const { HoTen, CCCD, TenThanhTich, NgayPhatSinh } = formData;

        if (!HoTen.trim() || !CCCD.trim() || !TenThanhTich.trim() || !NgayPhatSinh) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        if (!/^\d{12}$/.test(CCCD.trim())) {
            alert("CCCD phải gồm đúng 12 chữ số.");
            return;
        }

        const userIdRaw = localStorage.getItem('id_user');
        console.log('userIdRaw:', userIdRaw, 'typeof:', typeof userIdRaw);
        const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;
        console.log('userId sử dụng:', userId, 'typeof:', typeof userId);

        try {
            const res = await fetch("http://127.0.0.1:8000/profiles/them-thanh-tich", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-user-id': userId.toString()
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error(errData);
                alert(errData.detail || "Lỗi từ server");
                return;
            }

            alert("Thành tích đã được ghi nhận thành công!");
            setFormData({ HoTen: "", TenThanhTich: "", NgayPhatSinh: "", CCCD: "" });

        } catch (err: any) {
            alert("Lỗi khi ghi nhận thành tích. Vui lòng thử lại.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-white pl-[260px]">
            <div className="w-full max-w-2xl mx-auto mt-14 ml-14 p-6 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-[var(--color-p-400)] mb-10 text-center">
                    Thêm thành tích
                </h1>
                <form 
                    className="grid grid-cols-2 gap-x-6 gap-y-6 w-full"
                    onSubmit={handleSubmit}
                >
                    {/* Họ và tên */}
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

                    {/* CCCD */}
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

                    {/* Thành tích */}
                    <div className="col-span-2">
                        <label className="block font-semibold text-[var(--color-p-400)]">Thành tích*</label>
                        <input 
                            type="text"
                            name="TenThanhTich"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-md"
                            value={formData.TenThanhTich}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Ngày phát sinh */}
                    <div className="col-span-2">
                        <label className="block font-semibold text-[var(--color-p-400)]">Ngày phát sinh*</label>
                        <input
                            type="date"
                            name="NgayPhatSinh"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={formData.NgayPhatSinh}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Thông báo bắt buộc */}
                    <p className="text-sm text-red-600 col-span-2">*Thông tin bắt buộc</p>

                    {/* Nút submit */}
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

export default ThemThanhTich;