import { useEffect, useState } from "react";
import removeAccents from 'remove-accents';
import { useNavigate } from "react-router-dom";

const TraCuu = () => {
    type member_type = {
        MaThanhVien: string;
        HoTen: string;
        NamSinh: string;
        QueQuan: string;
        Doi: string;
        CCCD: string;
        
    };

    const [formData, setFormData] = useState<member_type>({
        MaThanhVien: '',
        HoTen: '',
        CCCD: '',
        NamSinh: '',
        QueQuan: '',
        Doi: ''
        
    }); 

    const [HoTen, setHoTen] = useState("");
    const [NamSinh, setNamSinh] = useState("");
    const [QueQuan, setQueQuan] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchMessage, setSearchMessage] = useState("");
    const [searchResults, setSearchResults] = useState<member_type[]>([]);

    const [selectedMember, setSelectedMember] = useState<member_type | null>(null);

    const handleSearch = async () => {
        const trimmedBirth = NamSinh.trim();
        const normalizedName = removeAccents(HoTen.trim().toLowerCase());
        const normalizedHometown = removeAccents(QueQuan.trim().toLowerCase());

        if (!normalizedName && !trimmedBirth && !normalizedHometown) {
            setSearchResults([]);
            setSearchMessage("Vui lòng nhập ít nhất một tiêu chí để tìm kiếm.");
            setShowSearch(true);
            return;
        }

        if (trimmedBirth && !/^\d{4}$/.test(trimmedBirth)) {
            setSearchResults([]);
            setSearchMessage("Năm sinh phải là 4 chữ số, ví dụ: 1995");
            setShowSearch(true);
            return;
        }

        const userIdRaw = localStorage.getItem('id_user');
        console.log('userIdRaw:', userIdRaw, 'typeof:', typeof userIdRaw);
        const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;
        console.log('userId sử dụng:', userId, 'typeof:', typeof userId);

        try {
            const response = await fetch('http://localhost:8000/profiles/tra-cuu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId.toString()
                },
                body: JSON.stringify({
                    HoTen: normalizedName,  
                    NamSinh: trimmedBirth,
                    QueQuan: normalizedHometown,
                    Doi: '',
                    NguoiDungDauToc: ''
                }),
            });

            if (!response.ok) {
                throw new Error("Lỗi khi gọi API tra cứu.");
            }

            const data = await response.json();
            setSearchResults(data);
            setSearchMessage("");
            setShowSearch(true);
        } catch (error) {
            console.error("Lỗi tìm kiếm:", error);
            setSearchResults([]);
            setSearchMessage("Đã xảy ra lỗi khi tìm kiếm.");
            setShowSearch(true);
        }
    };


    const handleExport = () => {
        if (searchResults.length === 0) return; 

        const header = ["Họ và tên", "Năm sinh", "Đời", "Quan hệ"];
        const csvRows = [
            header.join(","),
            ...searchResults.map(member =>
                [
                    `"${member.HoTen || ""}"`,
                    `"${member.NamSinh || ""}"`,
                    `"${member.Doi || "-"}"`,
                    `"${member.CCCD || "-"}"`
                ].join(",")
            )
        ];

        const csvContent = "\uFEFF" + csvRows.join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", "ket_qua_tra_cuu.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const navigate = useNavigate();
    const handleInforMember = (member: member_type) => {
        console.log("Thông tin thành viên được chọn:", member);
        navigate(`/profiles/tra-cuu/${member.MaThanhVien}`);
    }

    const handleCloseModal = () => {
        setSelectedMember(null);
    };

    return (
        <div className="min-h-screen bg-white pl-[260px]">
            <div className="w-full max-w-xl mx-auto mt-24 ml-20 p-6">
                <h1 className="text-4xl font-bold text-[var(--color-p-400)] mb-10 text-center">Tra cứu thành viên</h1>
                <form className="grid grid-cols-2 gap-x-4 gap-y-6 mb-4 w-full">
                    <div className="col-span-2">
                        <label className="block font-semibold text-[var(--color-p-400)]">Họ và tên</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={HoTen}
                            onChange={(e) => setHoTen(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">Năm sinh</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={NamSinh}
                            onChange={(e) => setNamSinh(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block font-semibold text-[var(--color-p-400)]">Quê quán</label>
                        <input
                            type="text"
                            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
                            value={QueQuan}
                            onChange={(e) => setQueQuan(e.target.value)}
                        />
                    </div>
                </form>
                <div className="flex justify-center">
                    <div 
                        onClick={handleSearch}
                        className="w-60 py-3 max-w-xs mt-2 bg-[var(--color-p-400)] text-white text-xl font-bold rounded-lg flex justify-center items-center cursor-pointer hover:brightness-110"
                    >
                        Tìm kiếm
                    </div>
                </div>

                {showSearch && (
                    <div className="mt-10 w-full">
                        <h2 className="text-3xl font-bold text-[var(--color-p-400)] mb-6 text-center">
                            Kết quả tra cứu
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-[var(--color-p-400)] text-white">
                                        <th className="border border-gray-300 px-4 py-2">Họ và tên</th>
                                        <th className="border border-gray-300 px-4 py-2">Năm sinh</th>
                                        <th className="border border-gray-300 px-4 py-2">Đời</th>
                                        <th className="border border-gray-300 px-4 py-2">CCCD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.length > 0 ? (
                                        searchResults.map((member, index) => (
                                            <tr 
                                                key={index} 
                                                className={index % 2 === 0 ? "bg-gray-100 text-center hover:cursor-pointer" : "text-center hover:cursor-pointer"}
                                                onClick={() => handleInforMember(member)}
                                            >
                                                <td className="border border-gray-300 px-4 py-2">{member.HoTen}</td>
                                                <td className="border border-gray-300 px-4 py-2">{member.NamSinh}</td>
                                                <td className="border border-gray-300 px-4 py-2">{member.Doi}</td>
                                                <td className="border border-gray-300 px-4 py-2">{member.CCCD}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="border border-gray-300 px-4 py-4 text-center text-red-500 font-bold">
                                                {searchMessage || "Không tìm thấy thành viên nào"}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {searchResults.length > 0 && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={handleExport}
                                        className="w-60 py-3 bg-[var(--color-p-400)] text-white text-xl font-bold rounded-lg hover:brightness-110 cursor-pointer flex items-center justify-center space-x-2"
                                    >
                                        <span className="ant-design--export-outlined text-white"></span>
                                        <span>Xuất kết quả</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedMember && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
                        onClick={handleCloseModal}
                    >
                        <div
                            className="bg-white rounded-lg shadow-lg p-8 min-w-[320px]"
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-[var(--color-p-400)] mb-4 text-center">
                                Thông tin thành viên
                            </h2>
                            <div className="mb-2">
                                <span className="font-semibold">Họ và tên:</span> {selectedMember.HoTen}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Năm sinh:</span> {selectedMember.NamSinh}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Quê quán:</span> {selectedMember.QueQuan}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold">Đời:</span> {selectedMember.Doi}
                            </div>
                            <div className="mb-4">
                                <span className="font-semibold">CCCD:</span> {selectedMember.CCCD}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 bg-[var(--color-p-400)] text-white rounded-lg font-semibold hover:brightness-110 cursor-pointer"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TraCuu;