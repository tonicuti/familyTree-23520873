import { NavLink, Outlet } from "react-router-dom";
import Logo from "../assets/Logo.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProfilesPage() {
    const normalizeUrl = (text: string) => {
        const vietnameseMap: { [key: string]: string } = {
          'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a', 'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
          'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a', 'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
          'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e', 'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
          'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o', 'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
          'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o', 'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
          'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u', 'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
          'đ': 'd'
        };
      
        return text
          .toLowerCase()
          .replace(/[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/g, match => vietnameseMap[match] || match)
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''); // Remove non-alphanumeric characters except for hyphens
    };

    const profiles = ["Main", "Tra cứu", "Thêm thành viên", "Thêm thành tích", "Ghi nhận kết thúc", "Lập báo cáo", "Xóa thành viên"];

    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();
    const handleSignOutClick = () => {
        localStorage.clear();
        navigate("/");
    };

    useEffect(() => {
        const CCCD = localStorage.getItem('CCCD')
        if(!CCCD)
            navigate('/')
    })

    const sidebarWidth = "w-[380px]";

    return (
        <div className="flex min-h-screen bg-white">
            <div className={`h-screen ${sidebarWidth} bg-[var(--color-p-100)] p-6 shadow-md z-30 flex flex-col fixed top-0 left-0`}>
                
                <h1 className="text-2xl font-bold text-amber-600 flex items-center justify-center">
                    <img src={Logo} alt="logo" className="mt-10 w-25 mr-2" />
                </h1>

                <div className="mt-6">
                    <p className="text-[var(--color-p-400)] font-bold">Tài khoản</p>
                    <NavLink to='/profiles/thong-tin-tai-khoan'>
                        {({isActive}) => (
                            <div 
                                className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-[var(--color-p-200)] rounded-lg
                                    ${isActive ? 'bg-[var(--color-p-200)] rounded-lg' : ''}
                                    `}
                            >
                                <p className="text-black">Thông tin tài khoản</p>
                            </div>
                            
                        )}
                    
                        
                    </NavLink>
                </div>

                <div className="mt-6">
                    <p className="text-[var(--color-p-400)] font-bold">Menu</p>
                    {profiles.map((profile) => (
                        <NavLink key={profile} to={`/profiles/${normalizeUrl(profile)}`}>
                            {({isActive}) => (
                                <div
                                    className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-[var(--color-p-200)] rounded-lg transition
                                        ${isActive ? 'bg-[var(--color-p-200)]' : 'hover:bg-[var(--color-p-200)]'
                                    }`} 
                                >
                                    <i className="bx bx-chevron-right text-gray-500"></i>
                                    <p>{profile}</p>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </div>

                <button 
                    onClick={() => {setShowConfirm(true)}}
                    className="w-full bg-[var(--color-p-400)] text-[var(--color-p-100)] px-8 py-2 mt-6 rounded-lg hover:brightness-150 transition cursor-pointer">
                    Đăng xuất
                </button>
            </div>
            <div className={`flex-1 ml-[260px]`}>
                <Outlet />
            </div>

            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="bg-[var(--color-p-100)] p-16 rounded-lg shadow-lg text-center">
                        <p className="text-[var(--color-p-400)] text-2xl font-bold mb-6">Bạn có chắc muốn đăng xuất?</p>
                        <div className="flex justify-center space-x-4 mt-10">
                            <button 
                                onClick={() => {
                                    setShowConfirm(true); 
                                    localStorage.removeItem('CCCD')
                                    handleSignOutClick();
                                }} 
                                className="bg-[var(--color-p-400)] text-white w-40 py-2 mr-20 rounded-lg hover:brightness-110 transition cursor-pointer"
                            >
                                Đăng xuất
                            </button>
                            <button 
                                onClick={() => setShowConfirm(false)} 
                                className="bg-gray-300 w-40 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}