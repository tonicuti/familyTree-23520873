import { useState } from "react";

const LapBaoCao: React.FC = () => {
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");
    const [showResult, setShowResult] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [dataMembers, setDataMembers] = useState<any[]>([]);
    const [dataAwards, setDataAwards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [filteredMembers, setFilteredMembers] = useState<any[]>(dataMembers);

    const handleGenerateReport = async () => {
        if (!startYear.trim()) {
            setErrorMessage("*Bạn cần phải nhập năm bắt đầu");
            setShowResult(false);
            return;
        }

        setErrorMessage("");
        setIsLoading(true);

        let start = parseInt(startYear, 10);
        let end = endYear.trim() ? parseInt(endYear, 10) : start;

        if (end < start) {
            setErrorMessage("*Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu.");
            setIsLoading(false);
            setShowResult(false);
            return;
        }

        const userIdRaw = localStorage.getItem('id_user');
        console.log('userIdRaw:', userIdRaw, 'typeof:', typeof userIdRaw);
        const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;
        console.log('userId sử dụng:', userId, 'typeof:', typeof userId);

        try {
            const response = await fetch(
                `http://127.0.0.1:8000/profiles/lap-bao-cao?start_year=${start}&end_year=${end}`,
                {
                headers: {
                    'x-user-id': userId.toString(),
                },
            }
            );
            const result = await response.json();

            const membersRaw = result.members_report || [];
            const awardsRaw = result.awards_report || [];

            const formattedMembers = membersRaw.map((item: any) => ({
                Nam: item.Nam,
                SoLuongSinh: item.SoLuongSinh,
                SoLuongMat: item.SoLuongMat,
                SoLuongKetHon: item.SoLuongKetHon ?? 0,
            }));

            const formattedAwards = awardsRaw.map((item: any) => ({
                TenThanhTich: item.TenThanhTich,
                SoLuongThanhTich: item.SoLuongThanhTich,
            }));

            setDataMembers(formattedMembers);
            setFilteredMembers(formattedMembers);
            setDataAwards(formattedAwards);
            setShowResult(true);
        } catch (error) {
            setErrorMessage("*Không thể lập báo cáo. Vui lòng thử lại.");
            setShowResult(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportReport = () => {
        if (dataMembers.length === 0 && dataAwards.length === 0) return;

        const headerMembers = ["Năm", "Số lượng sinh", "Số lượng mất", "Số lượng kết hôn"];
        const headerAwards = ["Loại thành tích", "Số lượng"];

        const csvMembers = [
            "Báo cáo tăng giảm thành viên",
            headerMembers.join(","),
            ...dataMembers.map((member: any) =>
                [
                    `"${member.Nam}"`,
                    `"${member.SoLuongSinh}"`,
                    `"${member.SoLuongMat}"`,
                    `"${member.SoLuongKetHon}"`
                ].join(",")
            ),
            "",
        ];

        const csvAwards = [
            "Báo cáo thành tích",
            headerAwards.join(","),
            ...dataAwards.map((award: any) =>
                [
                    `"${award.TenThanhTich}"`,
                    `"${award.SoLuongThanhTich}"`
                ].join(",")
            )
        ];

        const csvRows = [...csvMembers, ...csvAwards];

        const csvContent = "\uFEFF" + csvRows.join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "bao_cao.csv");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Giả sử sidebar là 260px, hãy đổi nếu sidebar của bạn khác chiều rộng này
    return (
        <div className="min-h-screen bg-white pl-[260px]">
            <div className="w-full max-w-4xl mx-auto mt-14 ml-14 p-6 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-center text-[var(--color-p-400)] mb-6">
                    Lập báo cáo
                </h1>

                <div className="grid grid-cols-2 gap-4 mb-6 w-full">
                    <input
                        type="number"
                        placeholder="Năm bắt đầu"
                        value={startYear}
                        onChange={(e) => {
                            setStartYear(e.target.value);
                        }}
                        className="p-3 border border-[var(--color-p-400)] rounded-md w-full text-center"
                    />

                    <input
                        type="number"
                        placeholder="Năm kết thúc"
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                        className="p-3 border border-[var(--color-p-400)] rounded-md w-full text-center"
                    />
                </div>

                <div className="flex justify-center mb-6 w-full">
                    <button
                        onClick={handleGenerateReport}
                        className="bg-[var(--color-p-400)] text-white font-semibold py-3 w-60 text-xl rounded-md hover:brightness-110 transition cursor-pointer"
                    >
                        {isLoading ? "Đang lập báo cáo..." : "Lập báo cáo"}
                    </button>
                </div>
                {errorMessage &&
                    <p className="text-red-500 text-sm flex justify-center">{errorMessage}</p>
                }

                {showResult && (
                    <div className="grid grid-cols-2 gap-6 w-full">
                        {/* Báo cáo tăng giảm thành viên */}
                        <div>
                            <h2 className="font-bold text-lg mb-2 text-center text-[var(--color-p-400)]">
                                Báo cáo tăng giảm thành viên
                            </h2>
                            <table className="w-full border border-[var(--color-p-400)] text-center">
                                <thead>
                                    <tr className="bg-[var(--color-p-200)] text-[var(--color-p-400)]">
                                        <th className="border border-[var(--color-p-400)] p-2">STT</th>
                                        <th className="border border-[var(--color-p-400)] p-2">Năm</th>
                                        <th className="border border-[var(--color-p-400)] p-2">Số lượng sinh</th>
                                        <th className="border border-[var(--color-p-400)] p-2">Số lượng mất</th>
                                        <th className="border border-[var(--color-p-400)] p-2">Số lượng kết hôn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.length > 0 ? (
                                        filteredMembers.map((item: any, index: number) => (
                                            <tr key={index} className="text-center">
                                                <td className="border border-[var(--color-p-400)] p-2">{index + 1}</td>
                                                <td className="border border-[var(--color-p-400)] p-2">{item.Nam}</td>
                                                <td className="border border-[var(--color-p-400)] p-2">{item.SoLuongSinh}</td>
                                                <td className="border border-[var(--color-p-400)] p-2">{item.SoLuongMat}</td>
                                                <td className="border border-[var(--color-p-400)] p-2">{item.SoLuongKetHon}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center p-4 text-gray-500">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Báo cáo thành tích */}
                        <div>
                            <h2 className="font-bold text-lg mb-2 text-center text-[var(--color-p-400)]">Báo cáo thành tích</h2>
                            <table className="w-full border border-[var(--color-p-400)] text-center">
                                <thead>
                                    <tr className="bg-[var(--color-p-200)] text-[var(--color-p-400)]">
                                        <th className="border border-[var(--color-p-400)] p-2">STT</th>
                                        <th className="border border-[var(--color-p-400)] p-2">Thành tích</th>
                                        <th className="border border-[var(--color-p-400)] p-2">Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataAwards.length > 0 ? (
                                        dataAwards.map((item: any, index: number) => (
                                            <tr key={index} className="text-center">
                                                <td className="border border-[var(--color-p-400)] p-2">{index + 1}</td>
                                                <td className="border border-[var(--color-p-400)] p-2">{item.TenThanhTich}</td>
                                                <td className="border border-[var(--color-p-400)] p-2">{item.SoLuongThanhTich}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center p-4 text-gray-500">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="col-span-2 flex justify-center mt-6">
                            <button
                                onClick={handleExportReport}
                                className="flex items-center justify-center gap-2 bg-[var(--color-p-400)] text-white font-semibold py-3 w-60 text-xl rounded-md hover:brightness-110 transition cursor-pointer"
                            >
                                <span className="ant-design--export-outlined text-white"></span>
                                <span>Xuất báo cáo</span>
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default LapBaoCao;