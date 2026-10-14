# Job Library — thư viện nghề và chủng tộc dùng chung cho nhiều game

**Ngày:** 14/10/2026 · **Trạng thái:** lớp thiết kế dữ liệu, chưa nối vào runtime chiến đấu của Skeleton Codex (xem mục 5).

Thư viện trả lời một câu hỏi: **một game chọn vài chủng tộc, cây nghề của game đó là gì?** Thân chung được thiết kế một lần; mỗi chủng tộc chỉ mang theo origin, thân sprite, bảng quyền vào trường phái và vài ngọn riêng. Mô hình giải thích ở `../Skeleton_Codex_V12_Balance/docs/14_Job_Tree_Roadmap_Multi_Race.md`.

## 1. Cấu trúc

```
library/
  schools.js            8 trường phái + mastery + 3 mức quyền (native / foreign / forbidden)
  trunk.js              34 nghề THÂN CHUNG: 6 T1 · 13 T2 · 13 T3 · 2 T4
  races/<race>.js       10 chủng tộc: origin T0, thân, quyền trường phái, ngọn riêng, nghề ẩn, body evolution
  compose.js            compose({races:[...]}) → nghề + cạnh + quyền + kiểm tra cấu trúc
  games/<game>.js       cấu hình một game = danh sách chủng tộc chọn từ thư viện
  docs/
    01_Race_Catalog.md  mô tả 10 chủng tộc và cách thêm chủng tộc mới
```

Mọi file là JS thuần gán vào `window.JobLibrary` để mở offline bằng `<script>`; phần object bên trong là JSON hợp lệ, copy sang engine khác được.

## 2. Dùng trong một game

```html
<script src="library/schools.js"></script>
<script src="library/trunk.js"></script>
<script src="library/races/skeleton.js"></script>
<script src="library/races/human.js"></script>
<script src="library/compose.js"></script>
<script>
  const g = JobLibrary.compose({ races: ['skeleton', 'human'] });
  if (g.errors.length) throw new Error(g.errors.join('\n'));   // sai cấu trúc: không dùng
  g.jobs            // mọi nghề (thân chung + origin + ngọn riêng của các chủng tộc đã chọn)
  g.edges           // cạnh {from,to,race}; race=null là cạnh chung
  g.access.human    // {jobId: 'native'|'foreign'|'hidden'|'blocked'|'other'}
  g.displayName('skeleton','fighter')   // {en:'Bone Fighter', vi:'Chiến Binh Xương'}
  g.warnings        // nghề chưa có gate, ngọn mọc từ nghề chủng tộc không vào được
</script>
```

Chỉ nạp file chủng tộc mà game cần. Chủng tộc không nạp thì không tồn tại với `compose`.

## 3. Quy ước dữ liệu

- **ID** snake_case, tên trần, không tiền tố chủng tộc. Tiền tố là chuyện hiển thị (`race.prefix`, `race.displayNames`).
- **Tier** đích = Tier tiền nhiệm + 1, không ngoại lệ. `compose` báo lỗi nếu vi phạm.
- **Ngọn riêng** chỉ mọc từ nghề chung hoặc nghề cùng chủng tộc; bắt đầu từ T3. Mỗi chủng tộc 5–8 ngọn; chủng tộc chủ lực của game có thể nhiều hơn (skeleton: 17 + 3 ẩn).
- **Gate** = 2 skill Tier n−1, mới so với mọi tiền nhiệm trên mọi tuyến (luật V12). `gate: null` = chưa thiết kế; `compose` liệt kê trong `warnings`, không chặn.
- **Quyền trường phái**: `native` vào từ T1; `foreign` gate Mastery +15, không ngọn T4–T5 trừ nghề lai được ghi rõ; `forbidden` chỉ qua nghề `hidden`. `blockedJobs` cấm từng nghề; `allowDespiteForbidden` mở từng nghề trong trường phái bị cấm (elf cấm Craft nhưng vẫn có Alchemist).
- **Thân sprite** (`body.rig`): `humanoid64` dùng lại gear overlay của skeleton theo cùng tọa độ vai/tay; rig khác (`humanoid64-short`, `humanoid64-broad`, `mer-tail`) phải vẽ lại overlay. Ghi rõ trong `body.notes` vì đây là chi phí lớn nhất khi thêm chủng tộc.
- **Marker** của ngọn riêng phải không trùng bảng marker trong `docs/12` của game dùng nó.

## 4. Thêm chủng tộc mới

1. Copy `races/human.js`, đổi `id`, `origin`, `body`, `schools`, `prefix`, `accent`, `silhouetteHook`.
2. Viết 5–8 `crowns`: mỗi cái có `from` là nghề chung T2–T4 hoặc ngọn cùng chủng tộc, `tier` = from + 1, `marker` một dòng.
3. Nếu có trường phái `forbidden` muốn mở bằng đường ẩn: thêm `hiddenAccess` và một crown `hidden:true` kèm `unlock`.
4. Nạp file và gọi `compose({races:[id]})`; sửa cho tới khi `errors` rỗng. `warnings` về gate để lại được.
5. Thêm chủng tộc vào `games/<game>.js` của game muốn dùng.

## 5. Quan hệ với Skeleton Codex V12.3

- Runtime (`skill-system.js`, `game-v10.js`) vẫn chạy 36 nghề với ID cũ. `races/skeleton.js → legacyIds` map ID cũ → ID thư viện để chuyển save sau này.
- Trang codex có mục **14 · Thư viện chủng tộc** đọc thẳng thư viện, cho xem cây của từng chủng tộc và danh sách nghề chưa có gate.
- Khác biệt chủ ý so với V12.3: Bone Raider gộp vào Duelist; Sword Wraith, Soul Weaver, Phantom Sniper, Soul Assassin nâng Tier để ngọn riêng luôn nằm trên T3 chung; Bone Acolyte → Adept (tên hiển thị skeleton giữ "Bone Acolyte"). Những nghề nâng Tier đang `gate: null` vì cần skill Tier mới.
- Bước nối runtime (chưa làm): đọc `compose()` thay mảng `J` trong `index.html`, map `legacyIds` trong loader save, thêm bộ vũ khí `unarmed`, viết skill cho các gate còn thiếu.
