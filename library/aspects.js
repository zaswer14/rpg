/* Job Library — KHÍ CHẤT (aspect): nguồn sức mạnh / chất liệu của một dạng nghề.
 * Hai dạng cùng khuôn nghề (ví dụ Kỵ Sĩ Ánh Sáng và Hắc Kỵ Sĩ) khác nhau trước hết ở khí chất:
 * khí chất quyết định màu nhấn, trạng thái gây ra và luật tài nguyên riêng. Khuôn nghề quyết định bộ anim và cơ chế lõi.
 *  - color: màu nhấn cho art (một màu chính; luật màu theo nhánh ở docs/02 mục 16 vẫn áp dụng trong từng game).
 *  - status: trạng thái gây lên địch (tên runtime đề xuất).
 *  - hook: luật gameplay mà mọi dạng mang khí chất này nên có một phần (không bắt buộc toàn bộ).
 */
window.JobLibrary = window.JobLibrary || {};
window.JobLibrary.aspects = {
  light:    { nameEn:'Light',    nameVi:'Ánh Sáng', color:'#F6E7A8', status:'blind',    hook:'Hồi máu đồng minh qua đòn đánh hoặc vệt để lại; khắc chế undead/curse.' },
  dark:     { nameEn:'Dark',     nameVi:'Hắc Ám',   color:'#7A5BA8', status:'weaken',   hook:'Đổi máu lấy sức mạnh, hút máu; càng ít máu càng mạnh.' },
  death:    { nameEn:'Death',    nameVi:'Tử Linh',  color:'#5DDF96', status:'curse',    hook:'Xác địch chết là tài nguyên: dựng lính, nổ xác, hồi Soul.' },
  soul:     { nameEn:'Soulfire', nameVi:'Hồn Hỏa',  color:'#7FB8FF', status:'soulburn', hook:'Xuyên giáp/vật cản; thân hoặc vũ khí bán trong suốt, lướt xuyên địch.' },
  blood:    { nameEn:'Blood',    nameVi:'Huyết',    color:'#B0352F', status:'bleed',    hook:'Trả máu để kích hoạt; rage tăng theo máu đã mất.' },
  nature:   { nameEn:'Nature',   nameVi:'Tự Nhiên', color:'#7FBF6A', status:'root',     hook:'Rễ/gai/cây mọc trên sàn thành địa hình; hồi máu theo thời gian.' },
  moon:     { nameEn:'Moon',     nameVi:'Nguyệt',   color:'#C9D8FF', status:'daze',     hook:'Mạnh trong bóng tối/ban đêm; chu kỳ pha (đầy–khuyết–mới) đổi bộ đòn.' },
  fire:     { nameEn:'Fire',     nameVi:'Hỏa',      color:'#E06A2A', status:'burn',     hook:'Để lại vùng cháy; tự đốt máu hoặc quá nhiệt khi lạm dụng.' },
  frost:    { nameEn:'Frost',    nameVi:'Băng',     color:'#CFEFF5', status:'chill',    hook:'Làm chậm cộng dồn tới đóng băng; dựng tường/sàn băng.' },
  storm:    { nameEn:'Storm',    nameVi:'Lôi',      color:'#F5E663', status:'shock',    hook:'Nảy sét giữa các mục tiêu; mạnh lên mục tiêu Ướt.' },
  tide:     { nameEn:'Tide',     nameVi:'Thủy Triều', color:'#3FB5C9', status:'soak',   hook:'Đẩy/kéo bằng sóng; vũng nước trên sàn là địa hình có lợi; chu kỳ triều.' },
  abyss:    { nameEn:'Abyss',    nameVi:'Vực Sâu',  color:'#4A3B8F', status:'pull',     hook:'Kéo địch về một điểm (trọng lực); xúc tu/bóng trồi lên từ sàn.' },
  stone:    { nameEn:'Stone',    nameVi:'Thạch',    color:'#9C8A6E', status:'stagger',  hook:'Không bị đẩy lùi; rung chấn mặt đất; chậm nhưng không ngã.' },
  rune:     { nameEn:'Rune',     nameVi:'Phù Văn',  color:'#5FA8FF', status:'mark',     hook:'Khắc dấu lên vũ khí/sàn/đồng minh rồi kích nổ hoặc kích hoạt sau.' },
  arcane:   { nameEn:'Arcane',   nameVi:'Huyền',    color:'#6C7BFF', status:'silence',  hook:'Kết hợp phép, hoán đổi, thao túng thời gian/không gian.' },
  machine:  { nameEn:'Machine',  nameVi:'Cơ Khí',   color:'#B8862B', status:'jam',      hook:'Nhiệt độ thay mana: lạm dụng thì quá nhiệt và đứng máy; module thay skill.' },
  steel:    { nameEn:'Steel',    nameVi:'Thép',     color:'#99A4A7', status:'armor_break', hook:'Kỹ thuật thuần, không phép: ổn định, ít rủi ro, không có bùng nổ lớn.' },
  feral:    { nameEn:'Feral',    nameVi:'Hoang Dã', color:'#C98A3A', status:'maul',     hook:'Combo càng dài càng nhanh (đói mồi); vồ, húc, cắn thay chém.' },
  glamour:  { nameEn:'Glamour',  nameVi:'Mị Ảo',    color:'#D98BE0', status:'charm',    hook:'Ảo ảnh, phân thân, mê hoặc; lừa AI địch chọn sai mục tiêu.' },
  ancestor: { nameEn:'Ancestor', nameVi:'Tổ Linh',  color:'#E3B868', status:'awe',      hook:'Hồn tổ tiên hiện ra trợ chiến ở mốc máu/thời điểm cố định.' },
  venom:    { nameEn:'Venom',    nameVi:'Độc',      color:'#8FD14F', status:'poison',   hook:'Sát thương theo thời gian cộng dồn; kết liễu làm độc lan.' },
  wind:     { nameEn:'Wind',     nameVi:'Phong',    color:'#BFE8D2', status:'knockup',  hook:'Nhảy cao, lơ lửng, hất tung; cơ động trên không.' },
  breath:   { nameEn:'Breath',   nameVi:'Khí',      color:'#F0E6D2', status:'stun',     hook:'Tích khí qua combo, đứng yên để hồi; kỷ luật thay vật phẩm.' }
};
