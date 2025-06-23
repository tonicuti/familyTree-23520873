import { useParams } from "react-router-dom";
import Main from './Main';
import TraCuu from "./TraCuu";
import ThemThanhTich from "./ThemThanhTich";
import ThemThanhVien from "./ThemThanhVien";
import GhiNhanKetThuc from "./GhiNhanKetThuc";
import LapBaoCao from "./LapBaoCao";
import ThongTinTaiKhoan from "./ThongTinTaiKhoan";
import XoaThanhVien from "./XoaThanhVien";


function renderComponent(profileId: string | undefined) {
    switch (profileId) {
        case "main":
            return <Main />;
        case "tra-cuu":
            return <TraCuu />;
        case "them-thanh-vien":
            return <ThemThanhVien />;
        case "xoa-thanh-vien":
            return <XoaThanhVien />;
        case "them-thanh-tich":
            return <ThemThanhTich />;
        case "ghi-nhan-ket-thuc":
            return <GhiNhanKetThuc />;
        case "lap-bao-cao":
            return <LapBaoCao />;
        case "thong-tin-tai-khoan":
            return <ThongTinTaiKhoan />;
        default:
            return <div className="p-4 text-red-500">Không tìm thấy trang!</div>;
    }
}


export default function Profile() {
    const params = useParams<{profileId: string}>();

    return (
        <div className="h-screen w-3/4">
            {/* typescript of Main content */}
            {renderComponent(params.profileId)}
        </div>
    )
}