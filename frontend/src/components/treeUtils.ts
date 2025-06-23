export interface thanhvien {
    MaThanhVien: string;
    HoTen: string;
    GioiTinh: string;
    MaThanhVienCu: string | null;
    CCCD: string;
    NgaySinh: string;
    Avatar?: string;
    QuanHe: string;
    MaVoChong: string | null;
    MaCha?: string | null;
    MaMe?: string | null;
}

export interface TreeNodeType extends thanhvien {
    children: TreeNodeType[];
    spouse?: TreeNodeType | null;
    cha?: TreeNodeType | null;
    me?: TreeNodeType | null;
}

export function buildTree(
    members: thanhvien[]
): { roots: TreeNodeType[]; memberMap: Record<string, TreeNodeType> } {
    const memberMap: Record<string, TreeNodeType> = {};
    members.forEach((m) => {
        memberMap[m.MaThanhVien] = { ...m, children: [] };
    });

    // Gán children: Ưu tiên gán vào cha, nếu không có cha thì gán vào mẹ
    members.forEach((m) => {
        if (m.MaCha && memberMap[m.MaCha]) {
            memberMap[m.MaCha].children.push(memberMap[m.MaThanhVien]);
        } else if (m.MaMe && memberMap[m.MaMe]) {
            memberMap[m.MaMe].children.push(memberMap[m.MaThanhVien]);
        }
    });

    // Gán spouse
    members.forEach((m) => {
        if (m.MaVoChong && memberMap[m.MaVoChong]) {
            const spouse = memberMap[m.MaVoChong];
            memberMap[m.MaThanhVien].spouse = spouse;
            if (!spouse.spouse) spouse.spouse = memberMap[m.MaThanhVien];
        }
    });

    // Gán cha/mẹ cho từng node
    Object.values(memberMap).forEach((node) => {
        node.cha = node.MaCha ? memberMap[node.MaCha] : undefined;
        node.me = node.MaMe ? memberMap[node.MaMe] : undefined;
    });

    // Ancestors: không cha, không mẹ, không phải dâu
    function isDauThanhVien(member: thanhvien): boolean {
        return (
            (member.GioiTinh === "Nữ" || member.GioiTinh === "nữ") &&
            !!member.MaVoChong &&
            (member.MaCha == null || member.MaCha === "") &&
            (member.MaMe == null || member.MaMe === "")
        );
    }
    const ancestors = members.filter(
        m =>
            (!m.MaCha || m.MaCha === "") &&
            (!m.MaMe || m.MaMe === "") &&
            !isDauThanhVien(m)
    );

    const roots = ancestors.map(a => memberMap[a.MaThanhVien]);
    return { roots, memberMap };
}