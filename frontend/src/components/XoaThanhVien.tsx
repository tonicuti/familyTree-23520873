import React, { useState } from "react";

const DeleteMemberForm: React.FC = () => {
    const [hoTen, setHoTen] = useState("");
    const [cccd, setCccd] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const userIdRaw = localStorage.getItem('id_user');
        console.log('userIdRaw:', userIdRaw, 'typeof:', typeof userIdRaw);
        const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;
        console.log('userId sử dụng:', userId, 'typeof:', typeof userId);

        try {
            const res = await fetch("http://127.0.0.1:8000/profiles/xoa-thanh-vien", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId.toString(),
                },
                body: JSON.stringify({
                    HoTen: hoTen.trim(),
                    CCCD: cccd.trim(),
                }),
            });

            if (res.status === 204) {
                setSuccess("Xóa thành viên thành công.");
                setHoTen("");
                setCccd("");
            } else {
                const data = await res.json();
                setError(data?.detail || "Lỗi khi xóa thành viên.");
            }
        } catch (err) {
            setError("Lỗi hệ thống.");
        }
        setLoading(false);
    };

    return (
        <form className="max-w-md mx-auto mr-40 mt-8 p-6 border rounded shadow bg-white" onSubmit={handleDelete}>
            <h2 className="text-xl font-bold mb-4 text-[var(--color-p-400)]">Xóa thành viên khỏi cây gia phả</h2>
            <div className="mb-4">
                <label className="block mb-1 font-medium text-[var(--color-p-400)]">Họ tên</label>
                <input
                    type="text"
                    value={hoTen}
                    onChange={e => setHoTen(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                    placeholder="Nhập họ tên thành viên"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1 font-medium text-[var(--color-p-400)]">CCCD</label>
                <input
                    type="text"
                    value={cccd}
                    onChange={e => setCccd(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                    placeholder="Nhập CCCD thành viên"
                />
            </div>
            {error && <div className="mb-2 text-[var(--color-p-400)]">{error}</div>}
            {success && <div className="mb-2 text-[var(--color-p-300)]">{success}</div>}
            <button
                type="submit"
                className="w-full bg-[var(--color-p-400)] hover:bg-[var(--color-p-300)] text-white font-semibold py-2 px-4 rounded cursor-pointer"
                disabled={loading}
            >
                {loading ? "Đang xóa..." : "Xóa thành viên"}
            </button>
        </form>
    );
};

export default function DeleteMemberPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <DeleteMemberForm />
        </div>
    );
}