const get = id => document.getElementById(id);
const records = [];
let feedbackTimer;
function buildPayload() {
  return {
    event: get("event").value,
    record_id: get("record").value.trim(),
    patient_ref: get("reference").value.trim(),
    clinic: get("clinic").value,
    message: get("message").value.trim(),
    test_mode: true
  };
}
function updatePreview() {
  get("payload").textContent = JSON.stringify(buildPayload(), null, 2);
  get("count").textContent = get("message").value.length;
}
function notify(message) {
  clearTimeout(feedbackTimer);
  get("feedback").textContent = message;
  feedbackTimer = setTimeout(() => {
    get("feedback").textContent = "";
  }, 6000);
}
function renderRecords() {
  const query = get("search").value.trim().toLowerCase();
  const visible = records.filter(record =>
    [record.time, record.id, record.clinic, record.status]
      .join(" ").toLowerCase().includes(query)
  );
  const body = get("rows");
  body.replaceChildren();
  if (!visible.length) {
    const row = body.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = query ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีรายการ";
    return;
  }
  for (const record of visible) {
    const row = body.insertRow();
    for (const value of [
      record.time, record.id, record.clinic, record.status
    ]) {
      row.insertCell().textContent = value;
    }
  }
}
get("event-form").addEventListener("input", updatePreview);
get("event-form").addEventListener("submit", async event => {
  event.preventDefault();
  const payload = buildPayload();
  if (!payload.record_id || !payload.message) {
    notify("กรุณากรอกเลขที่รายการและข้อความ");
    return;
  }
  const button = get("send");
  button.disabled = true;
  button.textContent = "กำลังจำลอง…";
  await new Promise(resolve => setTimeout(resolve, 700));
  records.unshift({
    time: new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Bangkok"
    }).format(new Date()),
    id: payload.record_id,
    clinic: payload.clinic,
    status: "Make รับแล้ว (จำลอง)"
  });
  get("total").textContent = records.length;
  get("accepted").textContent = records.length;
  renderRecords();
  button.disabled = false;
  button.textContent = "จำลองการส่งเข้า Make";
  notify("เพิ่มรายการจำลองแล้ว ไม่มีการส่งข้อความจริง");
});
get("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(
      JSON.stringify(buildPayload(), null, 2)
    );
    notify("คัดลอก JSON แล้ว");
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(get("payload"));
    selection.removeAllRanges();
    selection.addRange(range);
    notify("เลือกข้อความแล้ว กรุณาใช้คำสั่งคัดลอกของอุปกรณ์");
  }
});
get("test").addEventListener("click", async () => {
  const button = get("test");
  button.disabled = true;
  get("connection").textContent = "กำลังจำลอง…";
  await new Promise(resolve => setTimeout(resolve, 700));
  get("connection").textContent = "จำลองสำเร็จ · ยังไม่เชื่อมต่อจริง";
  button.disabled = false;
});
get("search").addEventListener("input", renderRecords);
updatePreview();
renderRecords();
