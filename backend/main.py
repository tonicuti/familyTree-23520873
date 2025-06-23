from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Query, Header, status
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator, Field, validator
from database import SessionLocal, engine
import models
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timezone, datetime, timedelta
from sqlalchemy import func, extract
import unicodedata
import re
from passlib.context import CryptContext
from typing import Annotated, Optional
import httpx
import os
import random
from dotenv import load_dotenv
import shutil
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from unidecode import unidecode
from collections import defaultdict



app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
models.Base.metadata.create_all(bind=engine) 

origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
]

app.add_middleware (
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

class UserCreate(BaseModel):
    HoTen: str
    CCCD: str
    GioiTinh: str
    NgaySinh: date
    QueQuan: str
    NgheNghiep: Optional[str] = None
    DiaChi: Optional[str] = None
    SDT: Optional[str] = None
    password: str

class UserModel(BaseModel):
    id: int
    CCCD: str

    class Config:
        from_attributes = True

        
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

def generate_ma_thanh_vien(db):
    prefix = "TV"
    # Lấy mã thành viên lớn nhất hiện có (dạng TVxxxx)
    last_member = (
        db.query(models.THANHVIEN)
        .filter(models.THANHVIEN.MaThanhVien.like(f"{prefix}%"))
        .order_by(models.THANHVIEN.MaThanhVien.desc())
        .first()
    )
    if last_member and last_member.MaThanhVien[2:].isdigit():
        last_num = int(last_member.MaThanhVien[2:])
        return f"{prefix}{last_num + 1:04d}"
    else:
        return f"{prefix}0001"

#Dang ky
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
@app.post('/SignUp', response_model=UserModel)
async def create_user(user: UserCreate, db: db_dependency):
    # Kiểm tra trùng CCCD ở bảng USERS
    existing_user = db.query(models.User).filter_by(CCCD=user.CCCD).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="CCCD đã được sử dụng để đăng ký.")

    # Kiểm tra trùng CCCD ở bảng THANHVIEN (phòng trường hợp người khác nhập lại)
    existing_tv = db.query(models.THANHVIEN).filter_by(CCCD=user.CCCD).first()
    if existing_tv:
        raise HTTPException(status_code=409, detail="CCCD đã tồn tại trong hệ thống thành viên.")
    
    # Validate CCCD
    if len(user.CCCD) != 12 or not user.CCCD.isdigit():
        raise HTTPException(status_code=400, detail="CCCD phải có đúng 12 chữ số.")

    # Validate password
    if len(user.password) < 4:
        raise HTTPException(status_code=409, detail="Mật khẩu phải có ít nhất 4 ký tự.")

    # Validate NgaySinh
    if user.NgaySinh > date.today():
        raise HTTPException(status_code=409, detail="Ngày sinh không được lớn hơn ngày hiện tại.")
    
    if user.SDT and (len(user.SDT.strip()) != 10 or not user.SDT.strip().isdigit()):
        raise HTTPException(status_code=409, detail="Số điện thoại phải có đúng 10 chữ số.")

    #Them vao bang User
    hashed_pw = pwd_context.hash(user.password)
    user_entry = models.User(
        CCCD=user.CCCD,
        password=hashed_pw,
    )
    db.add(user_entry)
    db.commit()
    db.refresh(user_entry)

    # Thêm vào bảng ThanhVien
    thanhvien = models.THANHVIEN(
        MaThanhVien=generate_ma_thanh_vien(db), 
        HoTen=user.HoTen,
        CCCD=user.CCCD,
        GioiTinh=user.GioiTinh,
        NgaySinh=user.NgaySinh,
        QueQuan=user.QueQuan,
        NgheNghiep=user.NgheNghiep.strip() if user.NgheNghiep else None,
        DiaChi=user.DiaChi.strip() if user.DiaChi else None,
        SDT=user.SDT.strip() if user.SDT else None,
        QuanHe="Gốc",
        NgayPhatSinh=date.today(),
        Doi=1,
        id_user=user_entry.id
    )
    db.add(thanhvien)
    db.commit()
    db.refresh(thanhvien)

    return user_entry

#Dang nhap
class SignInData(BaseModel):
    CCCD: str
    password: str
    
    class Config:
        from_attributes = True  
    
@app.post('/SignIn')
async def signin(data: SignInData, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.CCCD == data.CCCD).first()
    
    if not user or not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=401, detail='Sai thông tin đăng nhập')

    return {
        "message": "Đăng nhập thành công",
        "user": {
            "id": user.id,
            "CCCD": user.CCCD

        }
    }

#Thong tin tai khoan
class InfoBase(BaseModel):
    HoTen: str
    CCCD: str
    GioiTinh: str
    NgaySinh: date
    QueQuan: str
    NgheNghiep: Optional[str] = None
    SDT: Optional[str] = None
    DiaChi: Optional[str] = None
    Avatar: Optional[str] = None
    
    class Config:
        from_attributes = True

class CCCDRequest(BaseModel):
    CCCD: str

@app.post('/profiles/thong-tin-tai-khoan', response_model=InfoBase)
async def info(payload: CCCDRequest, db: Session = Depends(get_db)):
    user = db.query(models.THANHVIEN).filter(models.THANHVIEN.CCCD == payload.CCCD).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return InfoBase(
        HoTen=user.HoTen,
        CCCD=user.CCCD,
        GioiTinh=user.GioiTinh,
        NgaySinh=user.NgaySinh,
        QueQuan=user.QueQuan,
        NgheNghiep=user.NgheNghiep,
        SDT=user.SDT,
        DiaChi=user.DiaChi,
        Avatar=user.Avatar
    )
    
@app.post("/profiles/upload-avatar")
async def upload_avatar(CCCD: str = Form(...), avatar: UploadFile = File(...), db: Session = Depends(get_db)):
    user = db.query(models.THANHVIEN).filter(models.THANHVIEN.CCCD == CCCD).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    upload_dir = "./static/avatars"
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{CCCD}_{avatar.filename}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(avatar.file, buffer)

    user.Avatar = user.Avatar = f"http://127.0.0.1:8000/static/avatars/{filename}"
    db.commit()

    return JSONResponse(content={"avatarUrl": user.Avatar})

#Tra cuu
class SearchUser(BaseModel):
    MaThanhVien: Optional[str] = ""
    HoTen: Optional[str] = ""
    NamSinh: Optional[str] = ""
    QueQuan: Optional[str] = ""
    Doi: Optional[str] = ""
    CCCD: Optional[str] = ""
    TenVoChong: Optional[str] = ""
        
    class Config:
        from_attributes = True

def normalize(text: str) -> str:
    return unidecode(text.strip().lower()) if text else ""

def get_ten_vo_chong(tv, db):
    if tv.MaVoChong:
        spouse = db.query(models.THANHVIEN).filter_by(MaThanhVien=tv.MaVoChong).first()
        if spouse:
            return spouse.HoTen
    return "-"

def get_current_user(x_user_id: Optional[int] = Header(None), db: Session = Depends(get_db)) -> models.User:
    if x_user_id is None:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập hoặc thiếu thông tin người dùng.")
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
    return user

def get_id_user_cay_goc(current_user: models.User, db: Session) -> int:
    # Nếu là chủ cây
    ancestor = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.id_user == current_user.id,
        models.THANHVIEN.QuanHe == "Gốc"
    ).first()
    if ancestor:
        return current_user.id
    # Nếu là thành viên
    member = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.CCCD == current_user.CCCD
    ).first()
    if member:
        return member.id_user
    # Không thuộc cây nào
    raise HTTPException(status_code=404, detail="Bạn chưa thuộc cây gia phả nào.")

@app.post('/profiles/tra-cuu', response_model=List[SearchUser])
async def get_search_members(
    payload: SearchUser,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    id_user_cay = get_id_user_cay_goc(current_user, db)
    query = db.query(models.THANHVIEN).filter(models.THANHVIEN.id_user == id_user_cay)
    
    nam_sinh = payload.NamSinh
    ho_ten_norm = normalize(payload.HoTen)  
    que_quan_norm = normalize(payload.QueQuan)
    
    print(">>> Received search parameters:")
    print("HoTen:", ho_ten_norm)
    print("NamSinh:", payload.NamSinh)
    print("QueQuan:",   que_quan_norm)

    if nam_sinh:
        query = query.filter(extract('year', models.THANHVIEN.NgaySinh) == int(nam_sinh))

    thanh_viens = query.all()
    
    if ho_ten_norm:
        thanh_viens = [
            tv for tv in thanh_viens
            if ho_ten_norm in normalize(tv.HoTen)
        ]
        
    if que_quan_norm:
        thanh_viens = [
            tv for tv in thanh_viens
            if que_quan_norm in normalize(tv.QueQuan)
        ]
        
    results = []
    for tv in thanh_viens:
        ten_vo_chong = get_ten_vo_chong(tv, db)
        results.append(
            SearchUser(
                MaThanhVien=tv.MaThanhVien,
                HoTen=tv.HoTen,
                NamSinh=tv.NgaySinh.strftime("%d/%m/%Y") if tv.NgaySinh else None,
                QueQuan=tv.QueQuan or "-",
                Doi=str(tv.Doi) if tv.Doi is not None else "-",
                CCCD=str(tv.CCCD),
                TenVoChong=ten_vo_chong
            )
        )

    return results

#Chi tiet thanh vien
class ThanhTichOut(BaseModel):
    MaThanhTich: Optional[str] = None
    TenThanhTich: Optional[str] = None
    
class ThanhVienOut(BaseModel):
    MaThanhVien: str
    HoTen: str
    CCCD: str
    GioiTinh: str
    NgaySinh: date
    QueQuan: str
    NgheNghiep: Optional[str]
    DiaChi: Optional[str]
    MaThanhVienCu: Optional[str]
    QuanHe: str
    NgayPhatSinh: Optional[date]
    Doi: Optional[int]
    SDT: Optional[str]
    Avatar: Optional[str]
    TenVoChong: Optional[str] = None
    MaVoChong: Optional[str] = None
    ThanhTichs: List[ThanhTichOut] = []
    TinhTrang: str
    NgayMat: Optional[str] = None
    NguyenNhan: Optional[str] = None
    DiaDiemMaiTang: Optional[str] = None
    
    class Config:
        orm_mode = True

def find_spouse(ma_tv: str, db: Session) -> Optional[tuple]:
    current = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == ma_tv).first()
    if not current:
        return None

    # Nếu là vợ/chồng và có MaThanhVienCu, tìm người còn lại cùng MaThanhVienCu và khác QuanHe, khác bản thân
    if current.QuanHe in ("Vợ", "Chồng") and current.MaThanhVienCu:
        candidates = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.MaThanhVienCu == current.MaThanhVienCu,
            models.THANHVIEN.MaThanhVien != current.MaThanhVien,
            models.THANHVIEN.QuanHe.in_(["Vợ", "Chồng"])
        ).all()
        for c in candidates:
            if c.QuanHe != current.QuanHe:
                return (c.MaThanhVien, c.HoTen)
    
    # Ngoài ra, tìm bất cứ ai có MaVoChong là ma_tv
    candidate = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.MaVoChong == ma_tv
    ).first()
    if candidate:
        return (candidate.MaThanhVien, candidate.HoTen)

    # Hoặc MaVoChong của current
    if current.MaVoChong:
        candidate = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.MaThanhVien == current.MaVoChong
        ).first()
        if candidate:
            return (candidate.MaThanhVien, candidate.HoTen)

    # Hoặc ai có MaThanhVienCu là mình và QuanHe là vợ/chồng (trường hợp tổ tiên lấy vợ/chồng thêm)
    spouse = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.MaThanhVienCu == current.MaThanhVien,
        models.THANHVIEN.QuanHe.in_(["Vợ", "Chồng"])
    ).first()
    if spouse:
        return (spouse.MaThanhVien, spouse.HoTen)

    return None

@app.get("/profiles/tra-cuu/{ma_thanh_vien}", response_model=ThanhVienOut)
def get_member_detail(ma_thanh_vien: str, db: Session = Depends(get_db)):
    thanh_vien = db.query(models.THANHVIEN).filter_by(MaThanhVien=ma_thanh_vien).first()
    if not thanh_vien:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên")

    thanh_tichs = (
        db.query(models.THANHTICH, models.LOAITHANHTICH)
        .join(models.LOAITHANHTICH, models.THANHTICH.MaThanhTich == models.LOAITHANHTICH.MaThanhTich)
        .filter(models.THANHTICH.MaThanhVien == ma_thanh_vien)
        .all()
    )
    thanh_tich_list = [
        {
            "MaThanhTich": t.MaThanhTich,
            "TenThanhTich": l.TenThanhTich
        }
        for t, l in thanh_tichs
    ]
    
    ketthuc = (
        db.query(models.KETTHUC, models.NGUYENNHAN, models.DIADIEMMAITANG)
        .join(models.NGUYENNHAN, models.KETTHUC.MaNguyenNhan == models.NGUYENNHAN.MaNguyenNhan, isouter=True)
        .join(models.DIADIEMMAITANG, models.KETTHUC.MaDiaDiemMaiTang == models.DIADIEMMAITANG.MaDiaDiemMaiTang, isouter=True)
        .filter(models.KETTHUC.MaThanhVien == ma_thanh_vien)
        .first()
    )

    if ketthuc:
        _, ngnhan, ddmt = ketthuc
        tinh_trang = "Đã mất"
        ngay_mat = ketthuc[0].NgayMat.strftime("%d/%m/%Y") if ketthuc[0].NgayMat else None
        nguyen_nhan = ngnhan.TenNguyenNhan if ngnhan else None
        dia_diem_mai_tang = ddmt.TenDiaDiemMaiTang if ddmt else None
    else:
        tinh_trang = "Còn sống"
        ngay_mat = None
        nguyen_nhan = None
        dia_diem_mai_tang = None

    ten_vo_chong = "-"
    ma_vo_chong = None
    spouse = find_spouse(thanh_vien.MaThanhVien, db)
    if spouse:
        ma_vo_chong, ten_vo_chong = spouse
        print(spouse)
        
    print(ten_vo_chong)
    print(ma_vo_chong)

    return ThanhVienOut.from_orm(thanh_vien).copy(update={
        "TinhTrang": tinh_trang,
        "NgayMat": ngay_mat,
        "NguyenNhan": nguyen_nhan,
        "DiaDiemMaiTang": dia_diem_mai_tang,
        "TenVoChong": ten_vo_chong,
        "MaVoChong": ma_vo_chong,
        "ThanhTichs": thanh_tich_list,
    })

#Them thanh vien
class AddMembers(BaseModel):
    MaThanhVienCu: str
    QuanHe: str
    HoTen: str
    NgayPhatSinh: date
    CCCD: str
    GioiTinh: str
    NgaySinh: date
    QueQuan: str
    NgheNghiep: Optional[str] = None
    DiaChi: Optional[str] = None
    SDT: Optional[str] = None
    password: str
    MaCha: Optional[str] = None
    MaMe: Optional[str] = None 
    MaVoChong:Optional[str] = None
    
    @field_validator("CCCD")
    @classmethod
    def validate_cccd(cls, v):
        if len(v) != 12 or not v.isdigit():
            raise ValueError("CCCD phải có đúng 12 chữ số.")
        return v
    
    @field_validator("SDT")
    @classmethod
    def validate_sdt(cls, v):
        # Nếu có nhập (v không None, không rỗng), kiểm tra điều kiện
        if v and (len(v) != 10 or not v.isdigit()):
            raise ValueError("Số điện thoại phải có đúng 10 chữ số.")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 4:
            raise ValueError("Mật khẩu phải có ít nhất 4 ký tự.")
        return v

    @field_validator("NgaySinh")
    @classmethod
    def validate_ngay_sinh(cls, v: date):
        if v > date.today():
            raise ValueError("Ngày sinh không được lớn hơn ngày hiện tại")
        return v
    
    class Config:
        from_attributes = True

def slugify(text: str) -> str:
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'\s+', '', text)
    return text

def update_spouse_for_parents(db, ma_thanh_vien_con):
    con = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == ma_thanh_vien_con).first()
    if con and con.MaCha and con.MaMe:
        # Truy vấn lại cha mẹ mới nhất
        cha = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == con.MaCha).first()
        me = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == con.MaMe).first()
        if cha and me:
            changed = False
            if cha.MaVoChong != me.MaThanhVien:
                cha.MaVoChong = me.MaThanhVien
                changed = True
            if me.MaVoChong != cha.MaThanhVien:
                me.MaVoChong = cha.MaThanhVien
                changed = True
            if changed:
                db.add(cha)
                db.add(me)
                db.flush()
                db.commit()
                # Query lại từ DB để kiểm tra
                cha_db = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == cha.MaThanhVien).first()
                me_db = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == me.MaThanhVien).first()
                print(f"DB: cha.MaVoChong={cha_db.MaVoChong}, me.MaVoChong={me_db.MaVoChong}")

@app.post('/profiles/them-thanh-vien')
async def add_members(
    payload: AddMembers, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)    
):    
    if payload.NgayPhatSinh <= payload.NgaySinh:
        raise HTTPException(status_code=400, detail="Ngày phát sinh phải sau ngày sinh.")
    
    # 1. Tìm thành viên gốc của cây gia phả này
    ancestor = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.id_user == current_user.id,
        models.THANHVIEN.QuanHe == "Gốc"
    ).first()
    if not ancestor:
        raise HTTPException(
            status_code=403,
            detail="Chỉ chủ cây (Quan hệ 'Gốc') mới được phép thêm thành viên."
        )
    
    # 2. Lấy tất cả MaThanhVien của cây hiện tại
    family_ids = [
        tv.MaThanhVien
        for tv in db.query(models.THANHVIEN)
        .filter(models.THANHVIEN.id_user == current_user.id)
        .all()
    ]
    if payload.MaThanhVienCu not in family_ids:
        raise HTTPException(status_code=400, detail="Người đời trước phải thuộc trong cây gia phả hiện tại.")

    existing_user = db.query(models.User).filter(models.User.CCCD == payload.CCCD).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="CCCD đã tồn tại.")
    
    thanh_vien_cu = db.query(
        models.THANHVIEN.HoTen,
        models.THANHVIEN.MaThanhVien,
        models.THANHVIEN.Doi,
        models.THANHVIEN.GioiTinh, 
        models.THANHVIEN.NgaySinh,
        models.THANHVIEN.CCCD,
        func.strftime('%Y', models.THANHVIEN.NgaySinh).label("NamSinh")
    ).filter(models.THANHVIEN.MaThanhVien == payload.MaThanhVienCu).first()
    
    if not thanh_vien_cu:
        raise HTTPException(status_code=404, detail='Không tìm thấy đời trước')
    
    nam_sinh_cu = int(thanh_vien_cu.NamSinh)
    if payload.QuanHe in ['Chồng', 'Vợ']:
        if payload.CCCD == thanh_vien_cu.CCCD:
            raise HTTPException(status_code=409, detail="Không thể tự làm vợ/chồng của chính mình.")
        
        tuoi = date.today().year - payload.NgaySinh.year
        
        if payload.QuanHe == 'Chồng':
            if payload.GioiTinh != 'Nam':
                raise HTTPException(status_code=409, detail="Giới tính phải là Nam cho quan hệ Chồng.")
            if tuoi < 20:
                raise HTTPException(status_code=409, detail="Chồng phải từ đủ 20 tuổi trở lên.")
        
        if payload.QuanHe == 'Vợ':
            if payload.GioiTinh != 'Nữ':
                raise HTTPException(status_code=409, detail="Giới tính phải là Nữ cho quan hệ Vợ.")
            if tuoi < 18:
                raise HTTPException(status_code=409, detail="Vợ phải từ đủ 18 tuổi trở lên.")
        
        if thanh_vien_cu.GioiTinh == payload.GioiTinh:
            raise HTTPException(status_code=409, detail="Vợ/chồng phải khác giới tính với thành viên cũ.")
        
        existing_spouse = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.MaThanhVienCu == payload.MaThanhVienCu,
            models.THANHVIEN.QuanHe == payload.QuanHe
        ).first()
        if existing_spouse:
            raise HTTPException(status_code=409, detail=f"Thành viên này đã có {payload.QuanHe.lower()} rồi.")

        if abs(payload.NgaySinh.year - nam_sinh_cu) > 30:
            raise HTTPException(status_code=409, detail="Năm sinh không hợp lý, chênh lệch tuổi quá lớn.")
        
        doi = thanh_vien_cu.Doi
        
    if payload.QuanHe == 'Con':
        chenh_lech_tuoi = int(payload.NgaySinh.year) - nam_sinh_cu
        if chenh_lech_tuoi < 18:
            raise HTTPException(status_code=409, detail="Cha/mẹ phải lớn hơn con ít nhất 18 tuổi.")
        doi = thanh_vien_cu.Doi + 1
        
    if payload.QuanHe in ['Cha', 'Mẹ']:
        if payload.CCCD == thanh_vien_cu.CCCD:
            raise HTTPException(status_code=409, detail="Không thể tự làm cha mẹ của chính mình.")

        if payload.QuanHe == 'Cha' and payload.GioiTinh != 'Nam':
            raise HTTPException(status_code=409, detail="Giới tính phải là Nam cho quan hệ Cha.")
        if payload.QuanHe == 'Mẹ' and payload.GioiTinh != 'Nữ':
            raise HTTPException(status_code=409, detail="Giới tính phải là Nữ cho quan hệ Mẹ.")

        chenh_lech_tuoi = nam_sinh_cu - payload.NgaySinh.year
        if chenh_lech_tuoi < 18:
            raise HTTPException(status_code=409, detail="Cha/mẹ phải lớn hơn con ít nhất 18 tuổi.")
        
        doi = max(1, thanh_vien_cu.Doi - 1)
        existing_parent = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.MaThanhVienCu == payload.MaThanhVienCu,
            models.THANHVIEN.QuanHe == payload.QuanHe
        ).first()
        if existing_parent:
            raise HTTPException(status_code=409, detail=f"Thành viên này đã có {payload.QuanHe.lower()} rồi.")

    hashed_pw = pwd_context.hash(payload.password)
    new_user = models.User (
        CCCD=payload.CCCD,
        password=hashed_pw
    )
    db.add(new_user)
    db.flush()
    db.refresh(new_user)
    
    new_member = models.THANHVIEN(
        MaThanhVien=generate_ma_thanh_vien(db),
        HoTen=payload.HoTen,
        CCCD=payload.CCCD,
        GioiTinh=payload.GioiTinh,
        NgaySinh=payload.NgaySinh,
        SDT=payload.SDT.strip() if payload.SDT else None,
        DiaChi=payload.DiaChi.strip() if payload.DiaChi else None,
        MaThanhVienCu=payload.MaThanhVienCu,
        QuanHe=payload.QuanHe,
        NgayPhatSinh=payload.NgayPhatSinh,
        QueQuan=payload.QueQuan.strip(),
        NgheNghiep=payload.NgheNghiep.strip() if payload.NgheNghiep else None,
        Doi=doi,
        id_user=current_user.id
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)

    # ======= XỬ LÝ QUAN HỆ CHA/MẸ =======
    if payload.QuanHe in ['Cha', 'Mẹ']:
        con = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == payload.MaThanhVienCu).first()
        if con:
            if payload.QuanHe == 'Cha' and con.MaCha:
                raise HTTPException(status_code=400, detail="Thành viên này đã có cha.")
            if payload.QuanHe == 'Mẹ' and con.MaMe:
                raise HTTPException(status_code=400, detail="Thành viên này đã có mẹ.")
            
            if con.MaThanhVienCu and con.MaVoChong and con.MaThanhVienCu == con.MaVoChong:
                raise HTTPException(status_code=400, detail="Không thể thêm cha/mẹ cho dâu/rể.")

            # Cập nhật MaCha/MaMe cho thành viên con
            if payload.QuanHe == 'Cha':
                con.MaCha = new_member.MaThanhVien
            elif payload.QuanHe == 'Mẹ':
                con.MaMe = new_member.MaThanhVien
            db.add(con)
            db.flush()

            # Nếu thành viên con đã có cả cha và mẹ → cập nhật MaVoChong cho cả cha và mẹ
            if con.MaCha and con.MaMe:
                cha = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == con.MaCha).first()
                me = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == con.MaMe).first()
                if cha and me:
                    changed = False
                    if cha.MaVoChong != me.MaThanhVien:
                        cha.MaVoChong = me.MaThanhVien
                        changed = True
                    if me.MaVoChong != cha.MaThanhVien:
                        me.MaVoChong = cha.MaThanhVien
                        changed = True
                    if changed:
                        db.add(cha)
                        db.add(me)
                        db.flush()
                # >>> Cập nhật MaCha/MaMe cho tất cả con chung của hai người này <<<
                children = db.query(models.THANHVIEN).filter(
                    ((models.THANHVIEN.MaCha == cha.MaThanhVien) | (models.THANHVIEN.MaMe == me.MaThanhVien))
                ).all()
                for child in children:
                    # Nếu là con chung (cha và mẹ đều giống)
                    if child.MaCha == cha.MaThanhVien and child.MaMe == me.MaThanhVien:
                        continue  # đã đúng rồi
                    if child.MaCha == cha.MaThanhVien:
                        child.MaMe = me.MaThanhVien
                        db.add(child)
                    elif child.MaMe == me.MaThanhVien:
                        child.MaCha = cha.MaThanhVien
                        db.add(child)
                db.flush()
            db.commit()
            return {
                'message': 'Thêm thành viên thành công!',
                'updated_children': [c.MaThanhVien for c in db.query(models.THANHVIEN).filter(
                    ((models.THANHVIEN.MaCha == con.MaCha) & (models.THANHVIEN.MaMe == con.MaMe))
                ).all() if con.MaCha and con.MaMe]
            }

    # ======= XỬ LÝ QUAN HỆ CON =======
    if payload.QuanHe == 'Con':
        parent = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == payload.MaThanhVienCu).first()
        if parent:
            # Gán cha/mẹ dựa vào giới tính của parent
            if parent.GioiTinh == 'Nam':
                new_member.MaCha = parent.MaThanhVien
                if parent.MaVoChong:
                    new_member.MaMe = parent.MaVoChong
            elif parent.GioiTinh == 'Nữ':
                new_member.MaMe = parent.MaThanhVien
                if parent.MaVoChong:
                    new_member.MaCha = parent.MaVoChong
            db.add(new_member)
            db.flush()
            # Nếu có đủ cả cha và mẹ thì cập nhật MaVoChong cho cha mẹ (nếu chưa có)
            if new_member.MaCha and new_member.MaMe:
                cha = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == new_member.MaCha).first()
                me = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == new_member.MaMe).first()
                if cha and me:
                    changed = False
                    if cha.MaVoChong != me.MaThanhVien:
                        cha.MaVoChong = me.MaThanhVien
                        changed = True
                    if me.MaVoChong != cha.MaThanhVien:
                        me.MaVoChong = cha.MaThanhVien
                        changed = True
                    if changed:
                        db.add(cha)
                        db.add(me)
                        db.flush()
                # >>> Cập nhật MaCha/MaMe cho tất cả con chung của hai người này <<<
                children = db.query(models.THANHVIEN).filter(
                    ((models.THANHVIEN.MaCha == cha.MaThanhVien) | (models.THANHVIEN.MaMe == me.MaThanhVien))
                ).all()
                for child in children:
                    if child.MaCha == cha.MaThanhVien and child.MaMe == me.MaThanhVien:
                        continue
                    if child.MaCha == cha.MaThanhVien:
                        child.MaMe = me.MaThanhVien
                        db.add(child)
                    elif child.MaMe == me.MaThanhVien:
                        child.MaCha = cha.MaThanhVien
                        db.add(child)
                db.flush()
            db.commit()
            return {
                'message': 'Thêm thành viên thành công!',
                'updated_children': [c.MaThanhVien for c in db.query(models.THANHVIEN).filter(
                    ((models.THANHVIEN.MaCha == new_member.MaCha) & (models.THANHVIEN.MaMe == new_member.MaMe))
                ).all() if new_member.MaCha and new_member.MaMe]
            }
        
    # ======= XỬ LÝ QUAN HỆ VỢ/CHỒNG =======  
    if payload.QuanHe in ["Vợ", "Chồng"]:
        spouse = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien == payload.MaThanhVienCu).first()
        if spouse:
            spouse.MaVoChong = new_member.MaThanhVien
            new_member.MaVoChong = spouse.MaThanhVien
            db.add(spouse)
            db.add(new_member)
            db.flush()

            # Cập nhật MaCha/MaMe cho con
            if payload.QuanHe == "Vợ":
                cha = spouse
                me = new_member
            else:
                cha = new_member
                me = spouse

            children = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaCha == cha.MaThanhVien).all()
            for child in children:
                if not child.MaMe:
                    child.MaMe = me.MaThanhVien
                    db.add(child)
            children = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaMe == me.MaThanhVien).all()
            for child in children:
                if not child.MaCha:
                    child.MaCha = cha.MaThanhVien
                    db.add(child)
            db.commit()
        return {'message': 'Thêm vợ/chồng thành công!'}

#Forgot password
class ForgotPassRequest(BaseModel):
    cccd: str
    phone: str

class VerifyOTPRequest(BaseModel):
    cccd: str
    otp: str

class ResetPassRequest(BaseModel):
    cccd: str
    new_password: str

# @app.post("/ForgotPass")
# async def forgot_password(request: ForgotPassRequest, db: Session = Depends(get_db)):
#     tv = db.query(models.THANHVIEN).filter(
#         models.THANHVIEN.CCCD == request.cccd,
#         models.THANHVIEN.SDT == request.phone
#     ).first()
#     if not tv:
#         raise HTTPException(status_code=404, detail="CCCD hoặc số điện thoại không đúng.")

#     otp = generate_otp()
#     otp_store[request.cccd] = {
#         "otp": otp,
#         "expires": datetime.utcnow() + timedelta(minutes=5)
#     }

#     sent = send_otp_sms(request.phone, otp)
#     if not sent:
#         raise HTTPException(status_code=500, detail="Không thể gửi OTP qua SMS.")
#     return {"message": "Mã OTP đã được gửi đến số điện thoại."}

# @app.post("/OTP")
# def verify_otp(request: VerifyOTPRequest):
#     record = otp_store.get(request.cccd)
#     if not record or record["otp"] != request.otp:
#         raise HTTPException(status_code=400, detail="OTP không đúng hoặc đã hết hạn.")
#     if record["expires"] < datetime.utcnow():
#         otp_store.pop(request.cccd, None)
#         raise HTTPException(status_code=400, detail="OTP đã hết hạn.")
#     return {"message": "Xác thực OTP thành công."}

# @app.post("/ChangePass")
# def reset_password(request: ResetPassRequest, db: Session = Depends(get_db)):
#     user = db.query(models.User).filter(models.User.CCCD == request.cccd).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="Không tìm thấy người dùng.")
#     user.password = pwd_context.hash(request.new_password)
#     db.commit()
#     otp_store.pop(request.cccd, None)
#     return {"message": "Đặt lại mật khẩu thành công."}


#Them thanh tich
def generate_ma_thanh_tich(db: Session) -> str:
    count = db.query(models.LOAITHANHTICH).count() + 1
    return f"TT{count:04d}" 

def normalizeTT(text: str) -> str:
    return unidecode(text.strip().lower())


class ThanhTichCreate(BaseModel):
    HoTen: str  # tên người nhận thành tích
    CCCD: str 
    TenThanhTich: str
    NgayPhatSinh: date
    
@app.post("/profiles/them-thanh-tich")
def addAward(award: ThanhTichCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ancestor = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.id_user == current_user.id,
        models.THANHVIEN.QuanHe == "Gốc"
    ).first()
    if not ancestor:
        raise HTTPException(
            status_code=403,
            detail="Chỉ chủ cây mới được phép thêm thành tích."
        )
    
    thanhvien = db.query(models.THANHVIEN).filter(
        func.lower(func.trim(models.THANHVIEN.HoTen)) == award.HoTen.lower().strip(),
        models.THANHVIEN.id_user == current_user.id
    ).first()

    if not thanhvien:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên với họ tên đã nhập")
    
    ketthuc = db.query(models.KETTHUC).filter(
        models.KETTHUC.MaThanhVien == thanhvien.MaThanhVien
    ).first()

    ngay_mat = ketthuc.NgayMat if ketthuc else None

    print(f"NgayMat trong DB: {ngay_mat} (type: {type(ngay_mat)})")
    print(f"NgayPhatSinh FE gửi lên: {award.NgayPhatSinh} (type: {type(award.NgayPhatSinh)})")
    
    if not thanhvien.NgaySinh:
        raise HTTPException(status_code=400, detail="Thành viên chưa có ngày sinh")
    if award.NgayPhatSinh <= thanhvien.NgaySinh:
        raise HTTPException(status_code=400, detail="Ngày phát sinh phải lớn hơn ngày sinh của thành viên")
    if ngay_mat and award.NgayPhatSinh > ngay_mat:
        raise HTTPException(status_code=400, detail="Ngày phát sinh phải nhỏ hơn hoặc bằng ngày mất của thành viên")
    
    award_norm = normalizeTT(award.TenThanhTich)
    print(">>TenThanhTichChuanHoa: ", award_norm)

    loai_tt = db.query(models.LOAITHANHTICH).filter(
        models.LOAITHANHTICH.TenThanhTichChuanHoa == award_norm
    ).first()

    if not loai_tt:
        new_ma = generate_ma_thanh_tich(db)
        loai_tt = models.LOAITHANHTICH(
            MaThanhTich=new_ma,
            TenThanhTich=award.TenThanhTich.strip(),
            TenThanhTichChuanHoa=award_norm
        )
        db.add(loai_tt)
        db.commit()
        db.refresh(loai_tt)
        
    existed = db.query(models.THANHTICH).filter(
        models.THANHTICH.MaThanhVien == thanhvien.MaThanhVien,
        models.THANHTICH.MaThanhTich == loai_tt.MaThanhTich,
        models.THANHTICH.NgayPhatSinh == award.NgayPhatSinh
    ).first()

    if existed:
        raise HTTPException(status_code=409, detail="Thành tích này đã tồn tại cho thành viên")


    thanh_tich = models.THANHTICH(
        MaThanhVien=thanhvien.MaThanhVien,
        MaThanhTich=loai_tt.MaThanhTich,
        NgayPhatSinh=award.NgayPhatSinh
    )

    db.add(thanh_tich)
    db.commit()

    return {"message": "Thêm thành tích thành công"}


#Ghi nhan ket thuc
def generate_ma_nguyen_nhan(db: Session) -> str:
    count = db.query(models.NGUYENNHAN).count() + 1
    return f"NN{count:04d}" 

def generate_ma_dia_diem(db: Session) -> str:
    count = db.query(models.DIADIEMMAITANG).count() + 1
    return f"DD{count:04d}" 

def generate_ma_ket_thuc(db: Session) -> str:
    count = db.query(models.DIADIEMMAITANG).count() + 1
    return f"KT{count:04d}" 


class KetThucCreate(BaseModel):
    HoTen: str
    NgayMat: date
    TenNguyenNhan: str
    TenDiaDiemMaiTang: str
    CCCD: str
    
    @field_validator('HoTen', 'CCCD', 'TenNguyenNhan', 'TenDiaDiemMaiTang')
    @classmethod
    def not_empty(cls, v, info):
        if not v or not v.strip():
            raise ValueError(f"{info.field_name} không được bỏ trống")
        return v
    
@app.post("/profiles/ghi-nhan-ket-thuc")
def record_death(death: KetThucCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ancestor = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.id_user == current_user.id,
        models.THANHVIEN.QuanHe == "Gốc"
    ).first()
    if not ancestor:
        raise HTTPException(
            status_code=403,
            detail="Chỉ chủ cây mới được phép thêm ghi nhận kết thúc."
        )
    
    if not death.NgayMat:
        raise HTTPException(status_code=400, detail="Ngày mất không được bỏ trống")
    today = date.today()
    if death.NgayMat > today:
        raise HTTPException(
            status_code=400, 
            detail="Ngày mất không thể lớn hơn ngày hiện tại"
        )
        
    thanhvien = db.query(models.THANHVIEN).filter(
        func.lower(func.trim(models.THANHVIEN.HoTen)) == death.HoTen.lower().strip(),
        models.THANHVIEN.CCCD == death.CCCD.strip(),
        models.THANHVIEN.id_user == current_user.id
    ).first()

    if not thanhvien:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên với họ tên đã nhập")
    
    if not thanhvien.NgaySinh:
        raise HTTPException(status_code=400, detail="Thành viên chưa có ngày sinh")
    if death.NgayMat <= thanhvien.NgaySinh:
        raise HTTPException(
            status_code=400,
            detail="Ngày mất phải lớn hơn ngày sinh"
        )
    
    nguyen_nhan = db.query(models.NGUYENNHAN).filter(
        func.lower(func.trim(models.NGUYENNHAN.TenNguyenNhan)) == death.TenNguyenNhan.strip().lower()
    ).first()
    if not nguyen_nhan:
        ma_nn = generate_ma_nguyen_nhan(db)
        nguyen_nhan = models.NGUYENNHAN(
            MaNguyenNhan=ma_nn,
            TenNguyenNhan=death.TenNguyenNhan.strip()
        )
        db.add(nguyen_nhan)
        db.commit()
        db.refresh(nguyen_nhan)

    # Tìm hoặc tạo địa điểm
    dia_diem = db.query(models.DIADIEMMAITANG).filter(
        func.lower(func.trim(models.DIADIEMMAITANG.TenDiaDiemMaiTang)) == death.TenDiaDiemMaiTang.strip().lower()
    ).first()
    if not dia_diem:
        ma_dd = generate_ma_dia_diem(db)
        dia_diem = models.DIADIEMMAITANG(
            MaDiaDiemMaiTang=ma_dd,
            TenDiaDiemMaiTang=death.TenDiaDiemMaiTang.strip()
        )
        db.add(dia_diem)
        db.commit()
        db.refresh(dia_diem)

    existed = db.query(models.KETTHUC).filter(
        models.KETTHUC.MaThanhVien == thanhvien.MaThanhVien
    ).first()
    if existed:
        raise HTTPException(status_code=409, detail="Thành viên đã được ghi nhận kết thúc trước đó")

    ma_ket_thuc = generate_ma_ket_thuc(db)
    ket_thuc = models.KETTHUC(
        MaKetThuc=ma_ket_thuc,
        MaThanhVien=thanhvien.MaThanhVien,
        NgayMat=death.NgayMat,
        MaNguyenNhan=nguyen_nhan.MaNguyenNhan,
        MaDiaDiemMaiTang=dia_diem.MaDiaDiemMaiTang
    )

    db.add(ket_thuc)
    db.commit()
    return {"message": "Ghi nhận kết thúc thành công"}


#Lap bao cao
class BaoCaoTangGiamCreate(BaseModel):
    Nam: int
    SoLuongSinh: int
    SoLuongKetHon: int
    SoLuongMat: int

class BaoCaoThanhTichCreate(BaseModel):
    Nam: int
    MaThanhTich: str
    SoLuongThanhTich: int
    
@app.get("/profiles/lap-bao-cao")
def report(start_year: int, end_year: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    id_user_cay = get_id_user_cay_goc(current_user, db)
    tanggiam = []
    thanhtich_dict = defaultdict(int)

    for year in range(start_year, end_year + 1):
        births = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.id_user == id_user_cay,
            models.THANHVIEN.NgaySinh != None,
            models.THANHVIEN.NgaySinh.between(f"{year}-01-01", f"{year}-12-31")
        ).count()

        deaths = (
            db.query(models.KETTHUC)
            .join(models.THANHVIEN, models.KETTHUC.MaThanhVien == models.THANHVIEN.MaThanhVien)
            .filter(
                models.THANHVIEN.id_user == id_user_cay,
                models.KETTHUC.NgayMat != None,
                models.KETTHUC.NgayMat.between(f"{year}-01-01", f"{year}-12-31")
            ).count()
        )

        marriages = (
            db.query(models.THANHVIEN)
            .filter(
                models.THANHVIEN.id_user == id_user_cay,
                models.THANHVIEN.QuanHe.in_(["Vợ", "Chồng"]),
                models.THANHVIEN.NgayPhatSinh.between(f"{year}-01-01", f"{year}-12-31")
            )
            .count() // 2
        )


        tanggiam.append({
            "Nam": year,
            "SoLuongSinh": births,
            "SoLuongMat": deaths,
            "SoLuongKetHon": marriages
        })

        awards_query = (
            db.query(
                models.LOAITHANHTICH.TenThanhTich.label("TenThanhTich"),
                func.count(models.THANHTICH.id).label("SoLuong")
            )
            .join(models.THANHTICH, models.LOAITHANHTICH.MaThanhTich == models.THANHTICH.MaThanhTich)
            .join(models.THANHVIEN, models.THANHTICH.MaThanhVien == models.THANHVIEN.MaThanhVien)
            .filter(
                models.THANHVIEN.id_user == id_user_cay,
                models.THANHTICH.NgayPhatSinh.between(f"{year}-01-01", f"{year}-12-31")
            )
            .group_by(models.LOAITHANHTICH.TenThanhTich)
            .all()
        )

        for ten, so_luong in awards_query:
            thanhtich_dict[ten] += so_luong

    result = {
        "members_report": tanggiam,
        "awards_report": [
            {"TenThanhTich": ten, "SoLuongThanhTich": count}
            for ten, count in thanhtich_dict.items()
        ]
    }


    return result

#Cay gia pha
class ThanhVienOut(BaseModel):
    MaThanhVien: str
    HoTen: str
    CCCD: str
    GioiTinh: str
    NgaySinh: date
    QueQuan: str
    NgheNghiep: Optional[str]
    DiaChi: Optional[str]
    MaThanhVienCu: Optional[str]
    QuanHe: str
    NgayPhatSinh: Optional[date]
    Doi: Optional[int]
    SDT: Optional[str]
    Avatar: Optional[str]
    MaVoChong: Optional[str] = None
    MaCha: Optional[str] = None
    MaMe: Optional[str] = None

    class Config:
        from_attributes = True

def collect_descendants_all(root_id: str, db: Session, visited=None) -> set[str]:
    if visited is None:
        visited = set()
    if root_id in visited:
        return visited
    visited.add(root_id)

    # Thu thập TẤT CẢ các thành viên có MaThanhVienCu == root_id (không lọc QuanHe)
    children = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.MaThanhVienCu == root_id
    ).all()
    for child in children:
        if child.MaThanhVien not in visited:
            collect_descendants_all(child.MaThanhVien, db, visited)
    return visited

def find_parent(ma_thanh_vien: str, db: Session, parent_role: str) -> Optional[str]:
    parent = (
        db.query(models.THANHVIEN)
        .filter(
            models.THANHVIEN.MaThanhVienCu == ma_thanh_vien,
            models.THANHVIEN.QuanHe == parent_role
        )
        .first()
    )
    return parent.MaThanhVien if parent else None
    
    
@app.get("/profiles/main", response_model=List[ThanhVienOut])
def get_family_tree_full(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Tìm ancestor gốc
    ancestor = (
        db.query(models.THANHVIEN)
        .filter(
            models.THANHVIEN.id_user == current_user.id,
            models.THANHVIEN.QuanHe == "Gốc"
        )
        .first()
    )
    
    if not ancestor:
        # Tìm thành viên trong bất kỳ cây nào có CCCD trùng với user này
        member = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.CCCD == current_user.CCCD
        ).first()
        if member:
            # Lấy chủ cây (ancestor) theo id_user của thành viên này
            ancestor = db.query(models.THANHVIEN).filter(
                models.THANHVIEN.id_user == member.id_user,
                models.THANHVIEN.QuanHe == "Gốc"
            ).first()
    if not ancestor:
        raise HTTPException(status_code=404, detail="Không tìm thấy tổ tiên gốc.")

    ancestor_id = ancestor.MaThanhVien
    # 2. Thu thập tất cả descendant (con cháu) từ ancestor
    family_ids = collect_descendants_all(ancestor_id, db)
    family_list = db.query(models.THANHVIEN).filter(models.THANHVIEN.MaThanhVien.in_(family_ids)).all()

    # 3. Bổ sung cha/mẹ ngoại vi nếu thiếu
    member_ids = set(m.MaThanhVien for m in family_list)
    parent_ids_to_fetch = set()
    for member in family_list:
        if member.MaCha and member.MaCha not in member_ids:
            parent_ids_to_fetch.add(member.MaCha)
        if member.MaMe and member.MaMe not in member_ids:
            parent_ids_to_fetch.add(member.MaMe)
    if parent_ids_to_fetch:
        extra_parents = db.query(models.THANHVIEN).filter(
            models.THANHVIEN.MaThanhVien.in_(parent_ids_to_fetch)
        ).all()
        family_list += extra_parents

    # 4. Build mapping MaCha/MaMe
    cha_map = {}
    me_map = {}
    for m in family_list:
        if m.MaCha:
            cha_map[m.MaThanhVien] = m.MaCha
        if m.MaMe:
            me_map[m.MaThanhVien] = m.MaMe

    response = []
    for member in family_list:
        member_dict = dict(member.__dict__)
        member_dict['MaCha'] = cha_map.get(member.MaThanhVien)
        member_dict['MaMe'] = me_map.get(member.MaThanhVien)
        member_out = ThanhVienOut(**member_dict)
        response.append(member_out)
    return response
    
    
#Xoa thanh vien
class DeleteMemberRequest(BaseModel):
    HoTen: str
    CCCD: str
    
    class Config:
        from_attributes = True

def clear_member_links_and_data(db, thanhvien_id):
    # 1. Set NULL các liên kết trong bảng THANHVIEN
    db.query(models.THANHVIEN).filter(models.THANHVIEN.MaCha == thanhvien_id).update({"MaCha": None})
    db.query(models.THANHVIEN).filter(models.THANHVIEN.MaMe == thanhvien_id).update({"MaMe": None})
    db.query(models.THANHVIEN).filter(models.THANHVIEN.MaVoChong == thanhvien_id).update({"MaVoChong": None})
    db.commit()

    # 2. Xóa các thành tích của thành viên này
    db.query(models.THANHTICH).filter(models.THANHTICH.MaThanhVien == thanhvien_id).delete()
    db.commit()

    # 3. Xóa các ghi nhận kết thúc của thành viên này
    db.query(models.KETTHUC).filter(models.KETTHUC.MaThanhVien == thanhvien_id).delete()
    db.commit()
    
def is_dau_re(member):
    return member.MaThanhVienCu == member.MaVoChong

def is_main_family(member):
    return not is_dau_re(member)

@app.delete("/profiles/xoa-thanh-vien", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    req: DeleteMemberRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
): 
    ancestor = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.id_user == current_user.id,
        models.THANHVIEN.QuanHe == "Gốc"
    ).first()
    if not ancestor:
        raise HTTPException(
            status_code=403,
            detail="Chỉ chủ cây mới được phép xóa thành viên."
        )
        
    # 1. Tìm thành viên theo họ tên và CCCD
    member = db.query(models.THANHVIEN).filter(
        models.THANHVIEN.id_user == current_user.id,
        func.lower(func.trim(models.THANHVIEN.HoTen)) == req.HoTen.lower().strip(),
        models.THANHVIEN.CCCD == req.CCCD.strip()
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Không tìm thấy thành viên với họ tên và CCCD đã nhập.")

    # 2. Không cho xóa người tạo ra cây (chủ cây)
    if member.QuanHe == "Gốc" and member.id_user == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa: Đây là người tạo ra cây gia phả."
        )

    # 3. Kiểm tra nếu là Dâu/Rể (vợ/chồng của thành viên dòng họ)
    # is_partner = db.query(models.THANHVIEN).filter(
    #     (models.THANHVIEN.MaVoChong == member.MaThanhVien)
    # ).first()
    # if is_partner:
    #     clear_member_links_and_data(db, member.MaThanhVien)
        
    #     db.delete(member)
    #     db.commit()
    #     return
    if is_dau_re(member):
        clear_member_links_and_data(db, member.MaThanhVien)
        
        db.delete(member)
        db.commit()
        return
    if is_main_family(member) and member.MaVoChong != None:
        raise HTTPException(
            status_code=400,
            detail="Không thể xóa: Thành viên này không phải dâu/rể và vẫn còn liên kết trong cây gia phả."
        )
            
    # 4. Kiểm tra nếu KHÔNG có cha mẹ và KHÔNG có con (tức là độc lập, ngoại trừ chủ hộ đã kiểm tra ở trên)
    has_parent = member.MaCha is not None or member.MaMe is not None
    has_child = db.query(models.THANHVIEN).filter(
        (models.THANHVIEN.MaCha == member.MaThanhVien) | (models.THANHVIEN.MaMe == member.MaThanhVien)
    ).first() is not None

    # Nếu không có cha mẹ và không có con thì cho xóa
    if not has_parent or not has_child:
        clear_member_links_and_data(db, member.MaThanhVien)
        
        db.delete(member)
        db.commit()
        return

    # Nếu không phải dâu/rể và không phải người độc lập -> không cho xóa
    raise HTTPException(
        status_code=400,
        detail="Không thể xóa: Thành viên này vẫn còn liên kết trong cây gia phả."
    )