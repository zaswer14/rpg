/* Cấu hình game: Skeleton Codex. Một game = danh sách chủng tộc chọn từ thư viện + ghi chú riêng.
 * Để làm game khác: copy file này, đổi id và races. Thư viện không đổi.
 */
window.JobLibrary = window.JobLibrary || {}; window.JobLibrary.games = window.JobLibrary.games || {};
window.JobLibrary.games.skeleton_codex = {
  id: 'skeleton_codex', nameVi: 'Skeleton Codex',
  races: ['skeleton'],                 // đợt sau dự kiến thêm 'human' (docs/14 đợt 6)
  flagship: 'skeleton',
  runtime: 'V12.3 legacy ids',         // runtime chiến đấu vẫn dùng ID V12.3; map qua races.skeleton.legacyIds
  notes: 'Thư viện là nguồn thiết kế; dữ liệu chạy trong game-v10.js/skill-system.js chưa đọc từ thư viện.'
};
