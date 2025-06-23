import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type ThanhTichType = {
    MaThanhTich: string;
    TenThanhTich: string;
};

// Định nghĩa kiểu dữ liệu cho thành viên và cây gia phả
type ThanhVienType = {
    MaThanhVien: string;
    HoTen: string;
    CCCD: string;
    GioiTinh: string;
    NgaySinh: string;
    QueQuan: string;
    NgheNghiep?: string;
    DiaChi?: string;
    MaThanhVienCu?: string;
    QuanHe: string;
    NgayPhatSinh?: string;
    Doi?: number;
    SDT?: string;
    Avatar?: string;
    TenVoChong?: string | null;
    ThanhTichs?: ThanhTichType[];
    TinhTrang: string;
    NguyenNhan: string;
    NgayMat: string;
    DiaDiemMaiTang: string;
};

const ChiTietThanhVien: React.FC = () => {
    const { MaThanhVien } = useParams<{ MaThanhVien: string }>();
    const navigate = useNavigate();

    const [member, setMember] = useState<ThanhVienType | null>(null);
    const [loadingMember, setLoadingMember] = useState(false);

    useEffect(() => {
        if (!MaThanhVien) return;
        setLoadingMember(true);
        fetch(`http://localhost:8000/profiles/tra-cuu/${MaThanhVien}`)
        .then((res) => {
            if (!res.ok) throw new Error("Không tìm thấy thành viên!");
            return res.json();
        })
        .then((data) => setMember(data))
        .catch(() => setMember(null))
        .finally(() => setLoadingMember(false));
    }, [MaThanhVien]);

    return (
        <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="bg-white rounded-lg shadow-lg p-10 max-w-2xl w-full mt-10">
            <button
            onClick={() => navigate(-1)}
            className="text-white mb-6 px-4 py-2 bg-[var(--color-p-300)] rounded hover:bg-[var(--color-p-200)] font-semibold cursor-pointer"
            >
            ← Quay lại
            </button>
            <h2 className="text-3xl font-bold text-[var(--color-p-400)] mb-6 text-center">
            Thông tin thành viên
            </h2>
            {loadingMember ? (
            <div>Đang tải thông tin thành viên...</div>
            ) : member ? (
            <div className="mb-6">
                <div className="flex flex-col items-center mb-6">
                    {member.Avatar ? (
                        <img
                            src={member.Avatar}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full mb-2 object-cover border"
                        />
                        ) : (
                        <div className="w-24 h-24 rounded-full bg-[var(--color-p-300)] flex items-center justify-center mb-2 border">
                            <i className="solar--user-outline text-white text-4xl"></i>
                        </div>
                    )}
                <span className="text-2xl font-bold">{member.HoTen}</span>
                <div className="text-[var(--color-p-400)] font-semibold mt-1">
                    {member.TinhTrang}
                    </div>
                    {member.TinhTrang === "Đã mất" && (
                    <div className="text-gray-700 mt-1">
                        <div>Ngày mất: {member.NgayMat ?? "-"}</div>
                        <div>Nguyên nhân: {member.NguyenNhan ?? "-"}</div>
                        <div>Địa điểm mai táng: {member.DiaDiemMaiTang ?? "-"}</div>
                </div>
                )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <span className="font-semibold">Mã thành viên:</span> {member.MaThanhVien}
                    </div>
                    <div>
                        <span className="font-semibold">CCCD:</span> {member.CCCD}
                    </div>
                    <div>
                        <span className="font-semibold">Giới tính:</span> {member.GioiTinh}
                    </div>
                    <div>
                        <span className="font-semibold">Ngày sinh:</span>{" "}
                        {member.NgaySinh ? new Date(member.NgaySinh).toLocaleDateString() : ""}
                    </div>
                    <div>
                        <span className="font-semibold">Quê quán:</span> {member.QueQuan}
                    </div>
                    <div>
                        <span className="font-semibold">Đời:</span> {member.Doi ?? "-"}
                    </div>
                    <div>
                        <span className="font-semibold">Nghề nghiệp:</span> {member.NgheNghiep ?? "-"}
                    </div>
                    <div>
                        <span className="font-semibold">SĐT:</span> {member.SDT ?? "-"}
                    </div>
                    <div>
                        <span className="font-semibold">Địa chỉ:</span> {member.DiaChi ?? "-"}
                    </div>
                    <div>
                        <span className="font-semibold">Tên vợ/chồng:</span> {member.TenVoChong ?? "-"}
                    </div>
                </div>
                <div className="mt-6">
                    <span className="font-semibold">Thành tích:</span>
                    {member.ThanhTichs && member.ThanhTichs.length > 0 ? (
                        <ul className="list-disc ml-5 mt-2">
                        {member.ThanhTichs.map((tt) => (
                            <li key={tt.MaThanhTich} className="text-[var(--color-p-400)] font-medium">
                            {tt.TenThanhTich}
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <span className="ml-2">-</span>
                    )}
                </div>
            </div>
            ) : (
            <div className="text-red-500 font-bold">Không tìm thấy thành viên!</div>
            )}
        </div>
        </div>
    );
};

export default ChiTietThanhVien;