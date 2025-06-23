import { TreeNodeType } from "./treeUtils";

// Trả về mảng các thành viên trong cây (bao gồm cả dâu/rể)
export function getAllMembersInCurrentTree(roots: TreeNodeType[]): any[] {
  const result: any[] = [];
  const seen = new Set<string>();

  function traverse(node: TreeNodeType) {
    if (!node || seen.has(node.MaThanhVien)) return;
    seen.add(node.MaThanhVien);

    // push thông tin thành viên
    result.push({
      MaThanhVien: node.MaThanhVien,
      HoTen: node.HoTen,
      GioiTinh: node.GioiTinh,
      NgaySinh: node.NgaySinh,
      CCCD: node.CCCD,
      QuanHe: node.QuanHe,
      MaVoChong: node.MaVoChong,
      MaCha: node.MaCha,
      MaMe: node.MaMe,
    });

    // duyệt spouse (vợ/chồng), nếu chưa duyệt qua
    if (node.spouse && !seen.has(node.spouse.MaThanhVien)) {
      traverse(node.spouse);
    }

    // duyệt children
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  }

  roots.forEach(traverse);
  return result;
}