import { useNavigate } from "react-router-dom";
import HomeImg from "../assets/HomePage.png";
import Logo from "../assets/Logo.png";  

const Home = () => {
  const navigate = useNavigate(); // Hook để điều hướng

  const handleLoginClick = () => {
    navigate("/SignIn"); // Điều hướng đến trang đăng nhập
  };

  const handleSignUpClick = () => {
    navigate("/SignUp");
  }

  return (
    <div className="relative w-full h-screen">
        <img
            src={HomeImg}
            alt=""
            className="aabsolute inset-0 w-full h-full object-cover opacity-10"
        />

        
        <div className="absolute inset-0 flex flex-col items-center justify-center  bg-opacity-50">
            
            <img 
                src={Logo} 
                alt="Logo" 
                className="w-60 mb-10"
            />

            <h1 
                style={{color: "var(--color-p-400)"}}
                className="text-5xl font-bold mb-6"
            >
                Chào mừng đến với FAMILY SEARCH
            </h1>
            <h2 
                style={{color: "var(--color-p-400)"}}
                className="text-cyan-600 text-2xl font-regular w-230 text-center max-w-2xl"
            >
                Chúng tôi cung cấp cho bạn dịch vụ tạo cây gia phả một cách nhanh và dễ hiểu nhất. Hãy tham gia nào!
            </h2>

            {/* Nút Đăng Nhập và Đăng Ký */}
            <div className="flex gap-50  mt-10">
                <button
                    onClick={handleLoginClick} // Gọi hàm khi nhấn nút Đăng Nhập
                    className="text-[var(--color-p-100)] bg-[var(--color-p-300)] w-60 py-3 rounded-lg hover:brightness-110 transition duration-200 text-xl cursor-pointer"
                >
                    Đăng Nhập
                </button>
                <button
                    onClick={handleSignUpClick}
                    className="w-60 py-3 rounded-lg border-2 border-[var(--color-p-300)] text-[var(--color-p-300)] 
                                bg-transparent transition duration-200 text-xl cursor-pointer 
                                hover:bg-[var(--color-p-300)] hover:text-white"
                >
                    Đăng Ký
                </button>
            </div>

            
        </div>

        
    </div>
  );
};

export default Home;
