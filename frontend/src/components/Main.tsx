import React, { useEffect, useState } from "react";
import axios from "axios";
import { buildTree, thanhvien, TreeNodeType } from "./treeUtils";
import { TreeNode } from "./treeNode";
import { useNavigate } from "react-router-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getAllMembersInCurrentTree } from "./exportMember";

// Hàm đệ quy đếm số thành viên
function countMembers(node: TreeNodeType | null): number {
    if (!node) return 0;
    let count = 1;
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            count += countMembers(child);
        }
    }
    return count;
}
 
const MainPage = () => {
    const [members, setMembers] = useState<thanhvien[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        let timeoutId: number | undefined;

        const userStr = localStorage.getItem("user");
        if (!userStr) {
            setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
            setLoading(false);
            timeoutId = window.setTimeout(() => navigate("/"), 2000);
            return () => timeoutId && clearTimeout(timeoutId);
        }
        let userObj: any = null;
        try {
            userObj = JSON.parse(userStr);
        } catch {
            setError("Thông tin người dùng bị lỗi. Vui lòng đăng nhập lại.");
            setLoading(false);
            timeoutId = window.setTimeout(() => navigate("/"), 2000);
            return () => timeoutId && clearTimeout(timeoutId);
        }
        if (!userObj || !userObj.user) {
            setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            setLoading(false);
            timeoutId = window.setTimeout(() => navigate("/"), 2000);
            return () => timeoutId && clearTimeout(timeoutId);
        }

        const user = userObj.user; 
        setUserInfo(user); 

        setLoading(true);
        setError(null);
        axios
            .get('http://127.0.0.1:8000/profiles/main', {
                headers: { "x-user-id": String(user.id) }
            })
            .then((res) => {
                let data = Array.isArray(res.data) ? res.data : [];
                if (!data.length) {
                    const newUser: thanhvien = {
                        MaThanhVien: user.MaThanhVien,
                        HoTen: user.HoTen || "",
                        GioiTinh: user.GioiTinh || "",
                        MaThanhVienCu: null,
                        CCCD: user.CCCD || "",
                        NgaySinh: user.NgaySinh || "",
                        Avatar: user.Avatar || "",
                        QuanHe: "Gốc",
                        MaVoChong: null,
                    };
                    data = [newUser];
                }
                setMembers(data);
                setLoading(false);
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.detail) {
                    setError(err.response.data.detail);
                } else {
                    setError("Lỗi tải dữ liệu cây gia phả.");
                }
                setLoading(false);
            });

        return () => timeoutId && clearTimeout(timeoutId);
    }, [navigate]);

    if (loading) return <div>Đang tải cây gia phả...</div>;
    if (error) return <div style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>{error}</div>;

    const { roots } = buildTree(members);
    const allMembers = getAllMembersInCurrentTree(roots);
    console.log("Danh sách tất cả thành viên:", allMembers);

    // Nếu không có roots và có userInfo, hiển thị userInfo như node đơn lẻ
    if ((!roots || roots.length === 0) && userInfo) {
        const userNode: TreeNodeType = {
            MaThanhVien: userInfo.MaThanhVien || "",
            HoTen: userInfo.HoTen || "",
            GioiTinh: userInfo.GioiTinh || "",
            MaThanhVienCu: null,
            CCCD: userInfo.CCCD || "",
            NgaySinh: userInfo.NgaySinh || "",
            Avatar: userInfo.Avatar || "",
            QuanHe: "Gốc",
            MaVoChong: null,
            children: [],
        };
        return (
            <div className="flex h-screen bg-white">
                <div className="w-full flex-1 p-10 overflow-auto">
                    <h2 className="text-center text-2xl font-bold text-[var(--color-p-400)] mb-6">CÂY GIA PHẢ</h2>
                    <div className="flex justify-center">
                        <TreeNode node={userNode} />
                    </div>
                </div>
            </div>
        );
    }

    // Tìm cây có nhiều thành viên nhất
    let rootWithMaxMembers: TreeNodeType | null = null;
    let maxMembers = 0;
    if (roots && roots.length > 0) {
        for (const root of roots) {
            const count = countMembers(root);
            if (count > maxMembers) {
                maxMembers = count;
                rootWithMaxMembers = root;
            }
        }
    }

    return (
        <div className="min-h-screen bg-white pl-[300px]">
            <h2 className="text-center text-3xl font-bold text-[var(--color-p-400)] mb-6 mt-6 tracking-wide">CÂY GIA PHẢ</h2>
            <div className="flex justify-center items-center" style={{ minHeight: "calc(100vh - 110px)" }}>
            <div
                style={{
                    width: 1200,
                    maxWidth: "100%",
                    height: "85vh",
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: 16,
                    boxShadow: "0 2px 12px #0001",
                    overflow: "hidden",
                    position: "relative",
                    margin: "0 auto",
                    transition: "box-shadow 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <TransformWrapper
                    initialScale={1}
                    minScale={0.2}
                    maxScale={2.5}
                    centerOnInit
                    wheel={{ step: 0.1 }}
                    doubleClick={{ disabled: true }}
                >
                {() => (
                    <TransformComponent
                    wrapperStyle={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-center", 
                        overflow: "auto"
                    }}
                    contentStyle={{
                        margin: "0 auto",
                        paddingTop: 40,
                        paddingBottom: 30,
                        background: "transparent",
                        display: "block",
                        width: "fit-content", 
                    }}
                    >
                    <div style={{margin: "0 auto"}}>
                        {rootWithMaxMembers
                        ? <TreeNode node={rootWithMaxMembers} />
                        : <div>Không tìm thấy gốc cây gia phả</div>
                        }
                    </div>
                    </TransformComponent>
                )}
                </TransformWrapper>
            </div>
            </div>
        </div>
    );
};

export default MainPage;