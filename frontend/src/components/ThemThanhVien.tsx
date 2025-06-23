import { useState, useRef } from "react";

const provinces = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh",
    "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau",
    "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên",
    "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội",
    "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
    "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn",
    "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận",
    "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh",
    "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
    "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh",
    "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const relationOptions = ["Chồng", "Vợ", "Con", "Cha", "Mẹ"];

export type MemberType = {
    MaThanhVienCu: string;
    QuanHe: string;
    HoTen: string;
    NgayPhatSinh: string;
    CCCD: string;
    GioiTinh: string;
    NgaySinh: string;
    QueQuan: string;
    SDT: string;
    NgheNghiep: string;
    DiaChi: string;
    password: string;
};

const defaultForm: MemberType = {
    MaThanhVienCu: '',
    QuanHe: '',
    HoTen: '',
    NgayPhatSinh: '',
    CCCD: '',
    GioiTinh: '',
    NgaySinh: '',
    QueQuan: '',
    NgheNghiep: '',
    SDT: '',
    DiaChi: '',
    password: '',
};

const requiredFields: (keyof MemberType)[] = [
    "HoTen", "CCCD", "GioiTinh", "NgaySinh", "MaThanhVienCu", "QuanHe", "NgayPhatSinh", "QueQuan", "password"
];

const ThemThanhVien = () => {
    const [formData, setFormData] = useState<MemberType>(defaultForm);
    const [errors, setErrors] = useState<Partial<MemberType>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hoTenRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setFormData(defaultForm);
        setErrors({});
        hoTenRef.current?.focus();
    };

    // Validate từng trường
    const validate = (data: MemberType) => {
        let errs: Partial<MemberType> = {};
        // requiredFields.forEach(field => {
        //     if (!data[field]) {
        //         errs[field] = "Thiếu trường bắt buộc";
        //     }
        // });
        // Validate CCCD
        if (data.CCCD && (!/^\d{12}$/.test(data.CCCD))) errs.CCCD = "CCCD phải có đúng 12 chữ số";
        // Validate SDT chỉ khi có nhập
        if (data.SDT && (!/^\d{10}$/.test(data.SDT))) errs.SDT = "SDT phải có đúng 10 chữ số";
        // Validate password
        if (data.password && data.password.length < 4) errs.password = "Mật khẩu tối thiểu 4 ký tự";
        // Validate ngày sinh không lớn hơn hiện tại
        if (data.NgaySinh && new Date(data.NgaySinh) > new Date()) errs.NgaySinh = "Ngày sinh không hợp lệ";
        return errs;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined })); // clear error khi sửa
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate(formData);
        setErrors(errs);
        console.log("Validate errors:", errs);

        const { HoTen, CCCD, MaThanhVienCu, NgayPhatSinh, QuanHe, GioiTinh, NgaySinh, QueQuan, password } = formData;

        if (!HoTen.trim() || !CCCD.trim() || !MaThanhVienCu.trim() || !NgayPhatSinh || !QuanHe.trim() || !GioiTinh.trim() || !NgaySinh.trim() || !QueQuan.trim() || !password.trim()) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }
        
        if (Object.keys(errs).length > 0) {
            const msg = Object.values(errs).join('\n');
            alert(msg);
            return;
        }

        setIsSubmitting(true);
        const userIdRaw = localStorage.getItem('id_user');
        console.log('userIdRaw:', userIdRaw, 'typeof:', typeof userIdRaw);
        const userId = userIdRaw && !isNaN(Number(userIdRaw)) ? Number(userIdRaw) : null;
        console.log('userId sử dụng:', userId, 'typeof:', typeof userId);

        if (userId === null) {
            alert("User ID không hợp lệ, vui lòng đăng nhập lại!");
            setIsSubmitting(false);
            return;
        }

        const formattedData = {
            ...formData,
            NgayPhatSinh: toDateOnly(formData.NgayPhatSinh),
            NgaySinh: toDateOnly(formData.NgaySinh),
        };

        console.log("Chuẩn bị gửi request:", formattedData);

        try {
            const response = await fetch('http://127.0.0.1:8000/profiles/them-thanh-vien', {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-user-id": userId.toString(),
                },
                body: JSON.stringify(formattedData),
            });

            // ---- Xử lý lỗi trả về từ backend ----
            const contentType = response.headers.get("content-type") || "";
            let detailMsg = "";

            if (contentType.includes('application/json')) {
                const data = await response.json();

                // Nếu detail là string
                if (typeof data.detail === "string") {
                    detailMsg = data.detail;
                }
                // Nếu detail là array (validation error hoặc ValueError)
                else if (Array.isArray(data.detail)) {
                    // Lấy tất cả message, nối lại bằng xuống dòng
                    detailMsg = data.detail.map((item: any) => item.msg || item.detail || JSON.stringify(item)).join('\n');
                }
                // Nếu có message khác
                else if (data.message) {
                    detailMsg = data.message;
                } else {
                    detailMsg = JSON.stringify(data);
                }
            } else {
                detailMsg = await response.text();
            }

            if (response.ok) {
                alert("Thêm thành viên thành công!");
                resetForm();
            } else {
                // Nếu backend trả về lỗi, hiện alert lỗi rõ ràng
                alert(detailMsg || "Đã xảy ra lỗi không xác định.");
            }
        } catch (error) {
            alert("Lỗi kết nối đến server");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toDateOnly = (value: string) => {
        try {
            const date = new Date(value);
            return date.toISOString().slice(0, 10);
        } catch {
            return "";
        }
    };

    return (
        <div className="min-h-screen bg-white pl-[260px]">
            <div className="w-full max-w-2xl mx-auto mt-4 ml-14 p-6">
                <h1 className="text-4xl font-bold text-[var(--color-p-400)] mb-10 text-center">
                    Thêm thành viên
                </h1>

                <form className="grid grid-cols-2 gap-x-6 gap-y-6 w-full" onSubmit={handleSubmit}>
                    <InputField
                        label="Mã thành viên cũ*"
                        name="MaThanhVienCu"
                        value={formData.MaThanhVienCu}
                        onChange={handleChange}
                        error={errors.MaThanhVienCu}
                    />
                    <SelectField
                        label="Loại quan hệ*"
                        name="QuanHe"
                        value={formData.QuanHe}
                        options={relationOptions}
                        onChange={handleChange}
                        error={errors.QuanHe}
                    />
                    <InputField
                        label="Họ và tên*"
                        name="HoTen"
                        value={formData.HoTen}
                        onChange={handleChange}
                        inputRef={hoTenRef}
                        error={errors.HoTen}
                    />
                    <InputField
                        label="Ngày phát sinh*"
                        name="NgayPhatSinh"
                        type="date"
                        value={formData.NgayPhatSinh}
                        onChange={handleChange}
                        error={errors.NgayPhatSinh}
                    />
                    <InputField
                        label="Mã CCCD*"
                        name="CCCD"
                        value={formData.CCCD}
                        onChange={handleChange}
                        error={errors.CCCD}
                    />
                    <SelectField
                        label="Giới tính*"
                        name="GioiTinh"
                        value={formData.GioiTinh}
                        options={["Nam", "Nữ"]}
                        onChange={handleChange}
                        error={errors.GioiTinh}
                    />
                    <InputField
                        label="Ngày sinh*"
                        name="NgaySinh"
                        type="date"
                        value={formData.NgaySinh}
                        onChange={handleChange}
                        error={errors.NgaySinh}
                    />
                    <SelectField
                        label="Quê quán*"
                        name="QueQuan"
                        value={formData.QueQuan}
                        options={provinces}
                        onChange={handleChange}
                        error={errors.QueQuan}
                    />
                    <InputField
                        label="Nghề nghiệp"
                        name="NgheNghiep"
                        value={formData.NgheNghiep}
                        onChange={handleChange}
                        error={errors.NgheNghiep}
                    />
                    <InputField
                        label="Số điện thoại"
                        name="SDT"
                        value={formData.SDT}
                        onChange={handleChange}
                        error={errors.SDT}
                    />
                    <InputField
                        label="Địa chỉ"
                        name="DiaChi"
                        value={formData.DiaChi}
                        onChange={handleChange}
                        error={errors.DiaChi}
                    />
                    <InputField
                        label="Mật khẩu*"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                    />

                    <p className="text-sm text-red-600 col-span-2">*Thông tin bắt buộc</p>

                    <div className="col-span-2 flex justify-center mt-6">
                        <button
                            type="submit"
                            className="bg-[var(--color-p-400)] text-white w-60 text-xl font-semibold py-3 rounded-md hover:brightness-110 transition cursor-pointer"
                            disabled={isSubmitting}
                        >
                            Thêm thành viên
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type InputFieldProps = {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef?: React.RefObject<HTMLInputElement>;
};

const InputField = ({ label, name, type = "text", value, onChange, inputRef }: InputFieldProps) => (
    <div>
        <label className="block font-semibold text-[var(--color-p-400)]">{label}</label>
        <input
            ref={inputRef}
            type={type}
            name={name}
            className="w-full p-2 border border-[var(--color-p-400)] rounded-lg text-sm"
            value={value}
            onChange={onChange}
        />
    </div>
);

type SelectFieldProps = {
    label: string;
    name: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const SelectField = ({ label, name, value, options, onChange }: SelectFieldProps) => (
    <div>
        <label className="block font-semibold text-[var(--color-p-400)]">{label}</label>
        <select
            name={name}
            className="w-full p-2 border border-[var(--color-p-400)] rounded-md"
            value={value}
            onChange={onChange}
        >
            <option value="">-- Chọn --</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

export default ThemThanhVien;