/**
 * THIỆP CƯỚI PHAN VŨ & QUỲNH NHƯ — KẾT NỐI GOOGLE SHEET
 *
 * Đoạn mã này làm 3 việc:
 *   1. Lưu thông tin khách XÁC NHẬN THAM DỰ vào trang tính "Xác nhận".
 *   2. Lưu LỜI CHÚC vào trang tính "Lời chúc" và trả danh sách lời chúc cho thiệp hiển thị.
 *   3. Tạo LINK MỜI RIÊNG theo tên từng khách ở trang tính "Khách mời"
 *      (kèm tin nhắn mời soạn sẵn, trạng thái đã mở thiệp / đã xác nhận).
 *
 * Cách cài đặt: xem HUONG-DAN.html, mục "Kết nối Google Sheet".
 *   - Chạy hàm caiDat() một lần để tạo các trang tính.
 *   - Triển khai > Tùy chọn triển khai mới > Ứng dụng web
 *       Thực thi với tư cách: Tôi   |   Người có quyền truy cập: Bất kỳ ai
 *   - Dán URL ứng dụng web (đuôi /exec) vào CONFIG.sheetApi trong js/main.js.
 *
 * Sau khi sửa mã: Triển khai > Quản lý các tùy chọn triển khai > ✏️ > Phiên bản mới > Triển khai
 * (giữ nguyên URL), rồi chạy lại caiDat() một lần.
 */

const TEN = {
  XAC_NHAN: 'Xác nhận',
  LOI_CHUC: 'Lời chúc',
  KHACH:    'Khách mời',
  CAI_DAT:  'Cài đặt',
};

const COT = {
  XAC_NHAN: ['Thời gian', 'Mã khách', 'Họ tên', 'Khách của', 'Tham dự', 'Số người', 'Lời nhắn'],
  LOI_CHUC: ['Thời gian', 'Tên', 'Lời chúc', 'Hiển thị'],
  KHACH:    ['Mã khách', 'Xưng hô & tên (hiện trên thiệp)', 'Khách của', 'Ghi chú',
             'Link mời', 'Tin nhắn mời', 'Mở thiệp lần cuối', 'Trạng thái', 'Số người', 'Xác nhận lúc',
             'Ký tên lời cảm ơn'],
};

const LINK_MAC_DINH = 'https://vu-nhu.github.io/thiep-cuoi/';
const TIN_NHAN_MAC_DINH =
  'Thân gửi {ten},\n' +
  'Vũ & Như trân trọng kính mời {ten} đến dự {le} của chúng mình lúc {gio}, {thu} {ngay} ' +
  '(tức {amlich}) tại {diaDiem}.\n' +
  'Thiệp mời: {link}';
const TIN_NHAN_MAC_DINH_CU =
  'Thân gửi {ten},\n' +
  'Vũ & Như trân trọng kính mời {ten} đến dự Lễ Vu Quy của chúng mình lúc 10:00, Thứ Bảy 17.10.2026 ' +
  '(tức 08/09 năm Bính Ngọ) tại Sân bóng thôn An Bình, Quảng Ngãi.\n' +
  'Thiệp mời: {link}';

/* ===================== MENU & CÀI ĐẶT ===================== */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💌 Thiệp cưới')
    .addItem('Tạo / cập nhật link mời', 'taoLinkMoi')
    .addSeparator()
    .addItem('Cài đặt lại các trang tính', 'caiDat')
    .addToUi();
}

/** Chạy một lần: tạo 4 trang tính, tiêu đề cột, định dạng. Chạy lại không làm mất dữ liệu. */
function caiDat() {
  const ss = SpreadsheetApp.getActive();
  taoTrang_(ss, TEN.KHACH, COT.KHACH, [110, 260, 100, 180, 320, 420, 150, 110, 80, 150, 180]);
  taoTrang_(ss, TEN.XAC_NHAN, COT.XAC_NHAN, [150, 100, 200, 100, 100, 80, 320]);
  taoTrang_(ss, TEN.LOI_CHUC, COT.LOI_CHUC, [150, 180, 480, 80]);

  const kh = ss.getSheetByName(TEN.KHACH);
  kh.getRange('C2:C').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Nhà trai', 'Nhà gái'], true).setAllowInvalid(true).build());
  kh.getRange('K2:K').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['Vũ & Như', 'Sang & Nga'], true).setAllowInvalid(true).build());
  kh.getRange('F2:F').setWrap(true);
  kh.getRange('A1:D1').setBackground('#F3EBDE');
  kh.getRange('E1:J1').setBackground('#E8DCC8');
  kh.getRange('A1').setNote('Để trống — bấm menu 💌 Thiệp cưới > Tạo / cập nhật link mời để tự tạo mã.');
  kh.getRange('B1').setNote('Tên hiện trên phong bì và lời mời. Ví dụ: Anh Minh & gia đình, Cô Hoa, Bạn Lan Anh.');
  kh.getRange('K1').setNote('Để trống hoặc chọn Vũ & Như = ký tên mặc định. Chọn Sang & Nga = link thêm sent=bame.');

  const lc = ss.getSheetByName(TEN.LOI_CHUC);
  lc.getRange('D1').setNote('Bỏ tick để ẩn lời chúc khỏi thiệp.');
  // cả cột là ô tick sẵn → mỗi lời chúc mới chỉ cần 1 lần ghi
  lc.getRange('D2:D').setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());

  let cd = ss.getSheetByName(TEN.CAI_DAT);
  if (!cd) cd = ss.insertSheet(TEN.CAI_DAT);
  if (!cd.getRange('B1').getValue()) {
    cd.getRange('A1:B2').setValues([
      ['Link thiệp (trang web đã đưa lên mạng)', LINK_MAC_DINH],
      ['Mẫu tin nhắn mời ({ten}, {le}, {gio}, {thu}, {ngay}, {amlich}, {diaDiem}, {link})', TIN_NHAN_MAC_DINH],
    ]);
  }
  cd.getRange('A1:A2').setFontWeight('bold').setBackground('#F3EBDE').setVerticalAlignment('top');
  cd.getRange('B2').setWrap(true);
  cd.setColumnWidth(1, 300); cd.setColumnWidth(2, 560);

  const macDinh = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
  if (macDinh && macDinh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(macDinh);
  ss.setActiveSheet(kh);
}

function taoTrang_(ss, ten, cot, doRong) {
  let sh = ss.getSheetByName(ten);
  if (!sh) sh = ss.insertSheet(ten);
  sh.getRange(1, 1, 1, cot.length).setValues([cot])
    .setFontWeight('bold').setBackground('#F3EBDE').setFontColor('#33281F');
  sh.setFrozenRows(1);
  doRong.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
  return sh;
}

/* ===================== LINK MỜI THEO TÊN ===================== */

/** Menu: tạo mã khách, link mời riêng và tin nhắn mời cho mọi dòng có tên. */
function taoLinkMoi() {
  const ss = SpreadsheetApp.getActive();
  const kh = ss.getSheetByName(TEN.KHACH);
  const cd = ss.getSheetByName(TEN.CAI_DAT);
  if (!kh || !cd) { caiDat(); return taoLinkMoi(); }

  let goc = String(cd.getRange('B1').getValue() || LINK_MAC_DINH).trim();
  goc = goc.split('?')[0].split('#')[0];
  let mau = String(cd.getRange('B2').getValue() || TIN_NHAN_MAC_DINH);
  // Tự nâng mẫu mặc định cũ để tin nhắn Nhà trai dùng đúng Lễ Tân Hôn.
  if (mau === TIN_NHAN_MAC_DINH_CU) { mau = TIN_NHAN_MAC_DINH; cd.getRange('B2').setValue(mau); }

  const n = kh.getLastRow() - 1;
  if (n < 1) { SpreadsheetApp.getUi().alert('Bạn nhập tên khách vào cột B của trang "Khách mời" trước nhé.'); return; }
  const dl = kh.getRange(2, 1, n, 11).getValues();
  const daCo = {};
  dl.forEach(function (r) { if (r[0]) daCo[r[0]] = true; });

  let dem = 0;
  dl.forEach(function (r) {
    const ten = String(r[1] || '').trim();
    if (!ten) { r[4] = ''; r[5] = ''; return; }
    if (!r[0]) { r[0] = maMoi_(daCo); daCo[r[0]] = true; }
    // Tên nằm ngay trong link để thiệp hiển thị bì thư không cần gọi Sheet;
    // mã vẫn được giữ để theo dõi mở thiệp và xác nhận tham dự.
    let link = goc + '?to=' + encodeURIComponent(ten) + '&id=' + r[0];
    if (r[2] === 'Nhà gái') link += '&ben=gai';
    else if (r[2] === 'Nhà trai') link += '&ben=trai';
    if (String(r[10] || '').trim() === 'Sang & Nga') link += '&sent=bame';
    r[4] = link;
    const le = thongTinLe_(r[2]);
    r[5] = mau.split('{ten}').join(ten).split('{le}').join(le.ten)
      .split('{gio}').join(le.gio).split('{thu}').join(le.thu).split('{ngay}').join(le.ngay)
      .split('{amlich}').join(le.amLich).split('{diaDiem}').join(le.diaDiem).split('{link}').join(link);
    dem++;
  });
  kh.getRange(2, 1, n, 6).setValues(dl.map(function (r) { return r.slice(0, 6); }));
  ss.toast('Đã tạo ' + dem + ' link mời. Sao chép cột "Tin nhắn mời" để gửi qua Zalo/Messenger.', '💌 Thiệp cưới', 6);
}

/** Thông tin hiển thị theo cột "Khách của": Nhà trai = Lễ Tân Hôn, còn lại = Lễ Vu Quy. */
function thongTinLe_(ben) {
  if (ben === 'Nhà trai') return {
    ten: 'Lễ Tân Hôn', gio: '11:00', thu: 'Thứ Năm', ngay: '29.10.2026',
    amLich: '20/09 năm Bính Ngọ', diaDiem: 'Phước Lâm Viên, Đak Đoa, Gia Lai'
  };
  return {
    ten: 'Lễ Vu Quy', gio: '10:00', thu: 'Thứ Bảy', ngay: '17.10.2026',
    amLich: '08/09 năm Bính Ngọ', diaDiem: 'Sân bóng thôn An Bình, Quảng Ngãi'
  };
}

function maMoi_(daCo) {
  const kt = 'abcdefghjkmnpqrstuvwxyz23456789';
  let ma;
  do {
    ma = '';
    for (let i = 0; i < 6; i++) ma += kt.charAt(Math.floor(Math.random() * kt.length));
  } while (daCo[ma]);
  return ma;
}

/* ===================== API CHO THIỆP ===================== */

/** GET ?action=wishes  → danh sách lời chúc đang hiển thị (mới nhất trước)
 *  GET ?action=guest&id=… → tên và bên của khách theo mã
 *  GET ?action=open&id=… → ghi lại lúc khách mở thiệp */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'wishes') return json_({ ok: true, wishes: layLoiChuc_() });
    if (p.action === 'guest') return json_({ ok: true, guest: layKhach_(sach_(p.id, 20)) });
    if (p.action === 'open') { ghiMoThiep_(sach_(p.id, 20)); return json_({ ok: true }); }
    return json_({ ok: true, app: 'Thiệp cưới Vũ & Như' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** POST (nội dung JSON): { type: 'rsvp' | 'wish', ... }
 *  appendRow tự xử lý nhiều người gửi cùng lúc nên không cần khoá → trả lời nhanh hơn. */
function doPost(e) {
  let d;
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  if (d.hp) return json_({ ok: true });            // ô bẫy chống spam: người thật không điền
  try {
    if (d.type === 'rsvp') return json_(luuXacNhan_(d));
    if (d.type === 'wish') return json_(luuLoiChuc_(d));
    return json_({ ok: false, error: 'unknown_type' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** Sửa tay trang "Lời chúc" (bỏ tick, xoá dòng…) → làm mới danh sách hiển thị ngay. */
function onEdit(e) {
  if (e && e.range && e.range.getSheet().getName() === TEN.LOI_CHUC) xoaBoNho_();
}

function luuXacNhan_(d) {
  const ten = sach_(d.name, 80);
  if (!ten) return { ok: false, error: 'missing_name' };
  const id = sach_(d.id, 20);
  const ben = d.side === 'Nhà gái' ? 'Nhà gái' : 'Nhà trai';
  const den = d.attend === 'no' ? 'Không đến' : 'Sẽ đến';
  const so = den === 'Sẽ đến' ? Math.max(1, Math.min(20, parseInt(d.guests, 10) || 1)) : 0;
  const bayGio = new Date();
  trang_(TEN.XAC_NHAN).appendRow([bayGio, id, ten, ben, den, so, sach_(d.note, 500)]);
  if (id) capNhatKhach_(id, 8, [den, so, bayGio]);
  return { ok: true };
}

function luuLoiChuc_(d) {
  const ten = sach_(d.name, 60), loi = sach_(d.text, 500);
  if (!ten || !loi) return { ok: false, error: 'missing_fields' };
  trang_(TEN.LOI_CHUC).appendRow([new Date(), ten, loi, true]);
  xoaBoNho_();
  return { ok: true };
}

/** Danh sách lời chúc đang hiển thị, lưu tạm 5 phút để trả về nhanh; tự làm mới khi có lời chúc mới. */
function layLoiChuc_() {
  const bn = CacheService.getScriptCache();
  const daLuu = bn.get('loi-chuc');
  if (daLuu) return JSON.parse(daLuu);
  const sh = trang_(TEN.LOI_CHUC);
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const ds = sh.getRange(2, 1, n, 4).getValues()
    .filter(function (r) { return r[3] === true && r[1] && r[2]; })
    .map(function (r) { return { at: r[0] instanceof Date ? r[0].toISOString() : '', name: String(r[1]), text: String(r[2]) }; })
    .reverse()
    .slice(0, 200);
  const chuoi = JSON.stringify(ds);
  if (chuoi.length < 90000) bn.put('loi-chuc', chuoi, 300);
  return ds;
}

function xoaBoNho_() {
  try { CacheService.getScriptCache().remove('loi-chuc'); } catch (ignore) {}
}

function ghiMoThiep_(id) {
  if (id) capNhatKhach_(id, 7, [new Date()]);
}

/** Trả dữ liệu tối thiểu để thiệp hiển thị đúng người nhận từ mã trong link. */
function layKhach_(id) {
  if (!id) return null;
  const kh = SpreadsheetApp.getActive().getSheetByName(TEN.KHACH);
  if (!kh || kh.getLastRow() < 2) return null;
  const o = kh.getRange(2, 1, kh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  if (!o) return null;
  const r = kh.getRange(o.getRow(), 2, 1, 2).getValues()[0];
  return { name: sach_(r[0], 60), side: r[1] === 'Nhà gái' ? 'Nhà gái' : r[1] === 'Nhà trai' ? 'Nhà trai' : '' };
}

/** Ghi các giá trị liền nhau, bắt đầu từ cột `cot`, vào dòng của khách có mã `id` ở trang "Khách mời". */
function capNhatKhach_(id, cot, giaTri) {
  const kh = SpreadsheetApp.getActive().getSheetByName(TEN.KHACH);
  if (!kh || kh.getLastRow() < 2) return;
  const o = kh.getRange(2, 1, kh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  if (o) kh.getRange(o.getRow(), cot, 1, giaTri.length).setValues([giaTri]);
}

/* ===================== TIỆN ÍCH ===================== */

function trang_(ten) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(ten);
  if (!sh) { caiDat(); sh = ss.getSheetByName(ten); }
  return sh;
}

/** Cắt độ dài, bỏ ký tự điều khiển, chặn chèn công thức (=, +, -, @ ở đầu) */
function sach_(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
