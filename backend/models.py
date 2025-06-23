from database import Base
from sqlalchemy import Column, Integer, String, Boolean, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
    
class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    CCCD = Column(String(12), unique=True, nullable=False)
    password = Column(String, nullable=False)
    
    thanhviens = relationship("THANHVIEN", back_populates="created_by")
    
class THANHVIEN(Base):
    __tablename__ = 'THANHVIEN'
    
    MaThanhVien = Column(String, primary_key=True, index=True)
    HoTen = Column(String, nullable=False)
    CCCD = Column(String(12), unique=True)
    GioiTinh = Column(String(3), nullable=False)
    NgaySinh = Column(Date, nullable=False)
    QueQuan = Column(String, nullable=False)
    NgheNghiep = Column(String, nullable=True)
    DiaChi = Column(String, nullable=True)
    
    MaThanhVienCu = Column(String, ForeignKey("THANHVIEN.MaThanhVien"))  
    MaVoChong = Column(String, nullable=True) 
    MaCha = Column(String, nullable=True) 
    MaMe = Column(String, nullable=True)
    
    QuanHe = Column(String, nullable=False)
    NgayPhatSinh = Column(Date)
    Doi = Column(Integer)  
    SDT = Column(String(15), nullable=True)
    id_user = Column(Integer, ForeignKey("users.id")) 
    created_by = relationship("User", back_populates="thanhviens")
    
    Avatar = Column(String, nullable=True)
    
class QUANHE(Base):
    __tablename__ = 'QUANHE'

    MaQuanHe = Column(String, primary_key=True)
    TenQuanHe = Column(String)


class QUEQUAN(Base):
    __tablename__ = 'QUEQUAN'

    MaQueQuan = Column(String, primary_key=True)
    TenQueQuan = Column(String)


class NGHENGHIEP(Base):
    __tablename__ = 'NGHENGHIEP'

    MaNgheNghiep = Column(String, primary_key=True)
    TenNgheNghiep = Column(String)


class THANHTICH(Base):
    __tablename__ = 'THANHTICH'

    id = Column(Integer, primary_key=True)
    MaThanhVien = Column(Integer, ForeignKey("THANHVIEN.MaThanhVien"))
    MaThanhTich = Column(String, ForeignKey("LOAITHANHTICH.MaThanhTich"))
    NgayPhatSinh = Column(Date)


class LOAITHANHTICH(Base):
    __tablename__ = 'LOAITHANHTICH'

    MaThanhTich = Column(String, primary_key=True)
    TenThanhTich = Column(String)
    TenThanhTichChuanHoa = Column(String)


class KETTHUC(Base):
    __tablename__ = 'KETTHUC'

    id = Column(Integer, primary_key=True)
    MaKetThuc = Column(String)
    MaThanhVien = Column(Integer, ForeignKey("THANHVIEN.MaThanhVien"))
    NgayMat = Column(Date)
    MaNguyenNhan = Column(String, ForeignKey("NGUYENNHAN.MaNguyenNhan"))
    MaDiaDiemMaiTang = Column(String, ForeignKey("DIADIEMMAITANG.MaDiaDiemMaiTang"))


class NGUYENNHAN(Base):
    __tablename__ = 'NGUYENNHAN'

    MaNguyenNhan = Column(String, primary_key=True)
    TenNguyenNhan = Column(String)


class DIADIEMMAITANG(Base):
    __tablename__ = 'DIADIEMMAITANG'

    MaDiaDiemMaiTang = Column(String, primary_key=True)
    TenDiaDiemMaiTang = Column(String)


class BAOCAOTANGGIAM(Base):
    __tablename__ = 'BAOCAOTANGGIAM'

    MaBaoCaoTangGiam = Column(String, primary_key=True)
    Nam = Column(Integer)
    SoLuongSinh = Column(Integer)
    SoLuongKetHon = Column(Integer)
    SoLuongMat = Column(Integer)


class BAOCAOTHANHTICH(Base):
    __tablename__ = 'BAOCAOTHANHTICH'

    MaBaoCaoThanhTich = Column(String, primary_key=True)
    Nam = Column(Integer)
    MaThanhTich = Column(String, ForeignKey("LOAITHANHTICH.MaThanhTich"))
    SoLuongThanhTich = Column(Integer)
    
    
    
    
