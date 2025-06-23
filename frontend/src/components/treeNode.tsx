import { TreeNodeType } from "./treeUtils";

const DEFAULT_AVATAR =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='none' viewBox='0 0 60 60'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23FFFFFF'/%3E%3Cpath fill='%239CA3AF' fill-rule='evenodd' d='M30 14a9 9 0 100 18 9 9 0 000-18zm-7.5 9a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0zM30 34c-9.112 0-17 4.03-17 9v3a1 1 0 001 1h32a1 1 0 001-1v-3c0-4.97-7.888-9-17-9zm-15 9c0-3.698 6.617-7 15-7s15 3.302 15 7v2H15v-2z' clip-rule='evenodd'/%3E%3C/svg%3E";

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
};

const MemberCard = ({ member, role }: { member: TreeNodeType, role?: "dau" | "re" }) => (
    <div
        className={`family-node border rounded p-2 bg-[var(--color-p-100)] shadow w-[180px] h-[170px] flex flex-col items-center justify-center
            ${role === "dau" ? "ring-2 ring-blue-400" : ""}
            ${role === "re" ? "ring-2 ring-green-400" : ""}
        `}
        title={role === "dau" ? "Con dâu" : role === "re" ? "Con rể" : ""}
    >
        <div
            className="w-16 h-16 rounded-full overflow-hidden mb-1 flex items-center justify-center border-2 border-gray-200"
        >
            <img
                src={member.Avatar || DEFAULT_AVATAR}
                alt={member.HoTen || ""}
                className="object-cover w-full h-full"
            />
        </div>
        <div className="font-bold text-[var(--color-p-500)] text-center flex flex-row items-center justify-center flex-wrap gap-x-1">
            {member.HoTen || ""}
            {role === "dau" && <span className="text-xs text-blue-500 font-semibold ml-1">(Dâu)</span>}
            {role === "re" && <span className="text-xs text-green-500 font-semibold ml-1">(Rể)</span>}
        </div>
        <div className="text-sm text-[var(--color-p-400)]">{member.GioiTinh || ""}</div>
        <div className="text-xs text-[var(--color-p-400)]">{formatDate(member.NgaySinh)}</div>
        <div className="text-xs text-[var(--color-p-400)]">CCCD: {member.CCCD || ""}</div>
        <div className="text-xs text-[var(--color-p-400)] font-semibold">{member.MaThanhVien ? `Mã thành viên: ${member.MaThanhVien}` : ""}</div>
    </div>
);

function CoupleBox({ left, right }: {
    left: TreeNodeType; 
    right: TreeNodeType;
}) {
    return (
        <div className="flex flex-row items-center gap-2">
            <MemberCard member={left} />
            <span className="font-bold text-xl">-</span>
            <MemberCard member={right} />
        </div>
    );
}

function ParentsBox({ cha, me }: { cha?: TreeNodeType; me?: TreeNodeType }) {
    if (cha && me) {
        return <CoupleBox left={cha} right={me} />;
    }
    if (cha) return <MemberCard member={cha} />;
    if (me) return <MemberCard member={me} />;
    return null;
}

// Xác định role dâu/rể dựa trên quan hệ spouse và giới tính
function getMemberRoleInCouple(node: TreeNodeType, spouse: TreeNodeType): "dau" | "re" | undefined {
    if (!node || !spouse) return undefined;

    // Dâu: là nữ, có MaVoChong, không có cha mẹ, chồng là họ chính
    if (
        (node.GioiTinh === "Nữ" || node.GioiTinh === "nữ") &&
        !!node.MaVoChong &&
        node.MaCha == null &&
        node.MaMe == null
    ) {
        return "dau";
    }

    // Rể: là nam, có MaVoChong, vợ là họ chính
    if (
        (node.GioiTinh === "Nam" || node.GioiTinh === "nam") &&
        !!node.MaVoChong &&
        node.MaCha == null &&
        node.MaMe == null
    ) {
        return "re";
    }

    return undefined;
}

// Lấy con chung của cặp vợ chồng (lọc trùng)
function getCoupleChildren(node: TreeNodeType): TreeNodeType[] {
    if (node.spouse) {
        const allChildren = [...(node.children || []), ...(node.spouse.children || [])];
        const unique: Record<string, TreeNodeType> = {};
        allChildren.forEach(child => {
            unique[child.MaThanhVien] = child;
        });
        // Loại bỏ cha mẹ khỏi children
        return Object.values(unique).filter(
            child =>
                child.MaThanhVien !== node.MaThanhVien &&
                child.MaThanhVien !== node.spouse?.MaThanhVien
        );
    }
    return node.children || [];
}

export const TreeNode = ({
    node,
    renderedCouples = new Set<string>(),
    showParentConnector = false
}: {
    node: TreeNodeType;
    renderedCouples?: Set<string>;
    showParentConnector?: boolean;
}) => {
    // Nếu node có spouse và cặp này chưa render, render cặp vợ chồng
    if (node.spouse) {
        // Đảm bảo key cặp đồng nhất, nhỏ trước lớn sau
        const [idA, idB] = [node.MaThanhVien, node.spouse.MaThanhVien].sort();
        const coupleKey = `${idA}-${idB}`;
        if (!renderedCouples.has(coupleKey)) {
            const newRendered = new Set(renderedCouples);
            newRendered.add(coupleKey);
            const children = getCoupleChildren(node);

            return (
                <div className="flex flex-col items-center">
                    {showParentConnector && (
                        <div
                            style={{
                                width: "4px",
                                height: "48px",
                                background: "#ccc",
                                margin: "0 auto",
                                minHeight: "48px",
                                zIndex: 1
                            }}
                        />
                    )}
                    <CoupleBox
                        left={idA === node.MaThanhVien ? node : node.spouse}
                        right={idA === node.MaThanhVien ? node.spouse : node}
                    />
                    {children.length > 0 && (
                        <div className="flex items-start gap-12 relative mt-2" style={{ minWidth: 400 }}>
                            {children.length > 1 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "1.2rem",
                                        left: 0,
                                        right: 0,
                                        height: "2px",
                                        background: "#ccc",
                                        zIndex: 0
                                    }}
                                />
                            )}
                            {children.map((child) => (
                                <div
                                    className="flex flex-col items-center relative"
                                    key={child.MaThanhVien}
                                    style={{ minWidth: 200 }}
                                >
                                    {children.length > 1 && (
                                        <div style={{
                                            width: "2px",
                                            height: "18px",
                                            background: "#ccc",
                                            position: "absolute",
                                            top: 0,
                                            left: "50%",
                                            transform: "translateX(-50%)"
                                        }} />
                                    )}
                                    <TreeNode node={child} renderedCouples={newRendered} showParentConnector={true} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        // Nếu cặp đã render, không render lại vợ/chồng đơn lẻ nữa (tránh lặp).
        return null;
    }

    // Nếu không có spouse hoặc cặp đã render, render node đơn lẻ + children
    const children = node.children || [];
    return (
        <div className="flex flex-col items-center relative" style={{ minWidth: 200 }}>
            {showParentConnector && (
                <div
                    style={{
                        width: "4px",
                        height: "48px",
                        background: "#ccc",
                        margin: "0 auto",
                        minHeight: "48px",
                        zIndex: 1
                    }}
                />
            )}
            <MemberCard member={node} />
            {children.length > 0 && (
                <div className="flex items-start gap-12 relative mt-2" style={{ minWidth: 400 }}>
                    {children.length > 1 && (
                        <div
                            style={{
                                position: "absolute",
                                top: "1.2rem",
                                left: 0,
                                right: 0,
                                height: "2px",
                                background: "#ccc",
                                zIndex: 0
                            }}
                        />
                    )}
                    {children.map((child) => (
                        <div
                            className="flex flex-col items-center relative"
                            key={child.MaThanhVien}
                            style={{ minWidth: 200 }}
                        >
                            {children.length > 1 && (
                                <div style={{
                                    width: "2px",
                                    height: "18px",
                                    background: "#ccc",
                                    position: "absolute",
                                    top: 0,
                                    left: "50%",
                                    transform: "translateX(-50%)"
                                }} />
                            )}
                            <TreeNode node={child} renderedCouples={renderedCouples} showParentConnector={true} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};