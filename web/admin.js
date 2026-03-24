const root = document.getElementById("admin-root");
const { api, esc } = window.ITBaseCommon;

function devForm(dev = null) {
  return `
    <div style="display:grid;gap:8px;margin-bottom:10px">
      <input id="f-name" placeholder="ФИО / никнейм" value="${esc(dev?.name || "")}" />
      <input id="f-title" placeholder="Позиция" value="${esc(dev?.title || "")}" />
      <input id="f-stack" placeholder="Стек" value="${esc(dev?.stack || "")}" />
      <input id="f-skills" placeholder="Навыки через запятую" value="${esc((dev?.skills || []).join(", "))}" />
      <textarea id="f-experience" placeholder="Опыт">${esc(dev?.experience || "")}</textarea>
      <select id="f-grade">
        ${["Junior", "Middle", "Senior", "Lead"].map((g) => `<option ${dev?.grade === g ? "selected" : ""}>${g}</option>`).join("")}
      </select>
      <input id="f-email" placeholder="Email" value="${esc(dev?.contact_email || "")}" />
      <input id="f-tg" placeholder="Telegram" value="${esc(dev?.contact_telegram || "")}" />
    </div>
  `;
}

function readForm() {
  return {
    name: document.getElementById("f-name").value.trim(),
    title: document.getElementById("f-title").value.trim(),
    stack: document.getElementById("f-stack").value.trim(),
    skills: document.getElementById("f-skills").value.split(",").map((x) => x.trim()).filter(Boolean),
    experience: document.getElementById("f-experience").value.trim(),
    grade: document.getElementById("f-grade").value,
    contact_email: document.getElementById("f-email").value.trim(),
    contact_telegram: document.getElementById("f-tg").value.trim(),
  };
}

function validateForm(data) {
  if (!data.name || data.name.length < 2) return "Имя должно быть не короче 2 символов";
  if (!data.title || data.title.length < 2) return "Позиция должна быть не короче 2 символов";
  if (data.contact_email) {
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.contact_email);
    if (!ok) return "Некорректный email";
  }
  if (data.contact_telegram) {
    const ok = /^@[\w\d_]{3,}$/.test(data.contact_telegram);
    if (!ok) return "Telegram должен быть в формате @username";
  }
  if ((data.skills || []).length > 50) return "Навыков должно быть не больше 50";
  return "";
}

async function renderLogin() {
  root.innerHTML = `
    <h3>Вход в админ-панель</h3>
    <input id="p" type="password" placeholder="Пароль" />
    <div style="margin-top:10px"><button id="login">Войти</button></div>
  `;
  document.getElementById("login").onclick = async () => {
    const password = document.getElementById("p").value;
    await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
    await renderAdmin();
  };
}

async function renderAdmin(requestFilter = { status: "all", customer_telegram: "" }) {
  const me = await api("/api/admin/me");
  if (!me.isAdmin) return renderLogin();
  const devs = await api("/api/admin/developers");
  const params = new URLSearchParams({
    status: requestFilter.status || "all",
    customer_telegram: requestFilter.customer_telegram || "",
  });
  const reqs = await api(`/api/admin/contact-requests?${params.toString()}`);
  root.innerHTML = `
    <h3>Карточки разработчиков</h3>
    ${devForm()}
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button id="create">Добавить карточку</button>
      <button id="backup">Скачать backup</button>
      <button id="logout">Выйти</button>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px">
      <input id="import-file" type="file" accept=".csv,.xlsx" />
      <label style="display:flex;gap:6px;align-items:center">
        <input id="import-replace" type="checkbox" checked />
        Заменить базу перед импортом
      </label>
      <button id="import-btn">Импорт CSV/XLSX</button>
    </div>
    <div>${devs
      .map(
        (d) => `
      <div style="border:1px solid #2b3447;padding:8px;border-radius:8px;margin:8px 0">
        <b>#${d.id} ${esc(d.name)}</b> (${d.grade}) - ${esc(d.title)}
        <div class="muted">Контакты: ${esc(d.contact_email || "-")} / ${esc(d.contact_telegram || "-")}</div>
        <div style="margin-top:6px;display:flex;gap:8px">
          <button data-edit="${d.id}">Редактировать</button>
          <button data-del="${d.id}">Удалить</button>
        </div>
      </div>
    `
      )
      .join("")}</div>
    <hr />
    <h3>Запросы на контакты</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
      <select id="req-status">
        <option value="all" ${requestFilter.status === "all" ? "selected" : ""}>Все</option>
        <option value="new" ${requestFilter.status === "new" ? "selected" : ""}>Новые</option>
        <option value="processed" ${requestFilter.status === "processed" ? "selected" : ""}>Обработанные</option>
      </select>
      <input id="req-tg" placeholder="Поиск по Telegram заказчика" value="${esc(requestFilter.customer_telegram || "")}" />
      <button id="req-apply">Применить</button>
      <button id="req-reset">Сброс</button>
    </div>
    <div>${reqs
      .map(
        (r) => `
      <div style="border:1px solid #2b3447;padding:8px;border-radius:8px;margin:8px 0">
        <b>Request #${r.id}</b> / Dev #${r.developer_id} ${esc(r.developer_name)} (${r.developer_grade})
        <div>Telegram заказчика: ${esc(r.customer_telegram)}</div>
        <div>Сообщение: ${esc(r.message || "-")}</div>
        <div>Статус: <b>${r.status}</b></div>
        <button data-mark="${r.id}" ${r.status === "processed" ? "disabled" : ""}>Отметить обработанным</button>
      </div>
    `
      )
      .join("")}</div>
  `;

  document.getElementById("create").onclick = async () => {
    const form = readForm();
    const err = validateForm(form);
    if (err) return alert(err);
    await api("/api/admin/developers", { method: "POST", body: JSON.stringify(form) });
    await renderAdmin(requestFilter);
  };
  document.getElementById("backup").onclick = async () => {
    window.location.href = "/api/admin/backup";
  };
  document.getElementById("import-btn").onclick = async () => {
    const input = document.getElementById("import-file");
    if (!input.files || !input.files[0]) return alert("Выбери CSV или XLSX файл");
    const replace = Boolean(document.getElementById("import-replace")?.checked);
    const fd = new FormData();
    fd.append("file", input.files[0]);
    const res = await fetch(`/api/admin/developers/import?replace_existing=${replace ? "1" : "0"}`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.detail || "Ошибка импорта");
    const firstErrors = (data.errors || [])
      .slice(0, 5)
      .map((e) => `Строка ${e.row}: ${e.error}`)
      .join("\n");
    alert(
      `Импорт завершен.\nУдалено старых карточек: ${data.deleted_developers || 0}\nДобавлено: ${data.inserted}\nСтрок в файле: ${data.total_rows}` +
        (firstErrors ? `\nОшибки:\n${firstErrors}` : "")
    );
    await renderAdmin(requestFilter);
  };
  document.getElementById("logout").onclick = async () => {
    await api("/api/admin/logout", { method: "POST", body: "{}" });
    await renderLogin();
  };
  document.getElementById("req-apply").onclick = async () => {
    const status = document.getElementById("req-status").value;
    const customerTelegram = document.getElementById("req-tg").value.trim();
    await renderAdmin({ status, customer_telegram: customerTelegram });
  };
  document.getElementById("req-reset").onclick = async () => {
    await renderAdmin({ status: "all", customer_telegram: "" });
  };

  devs.forEach((d) => {
    const delBtn = document.querySelector(`[data-del="${d.id}"]`);
    const editBtn = document.querySelector(`[data-edit="${d.id}"]`);
    delBtn.onclick = async () => {
      if (!confirm(`Удалить #${d.id}?`)) return;
      await api(`/api/admin/developers/${d.id}`, { method: "DELETE" });
      await renderAdmin(requestFilter);
    };
    editBtn.onclick = async () => {
      root.innerHTML = `
        <h3>Редактирование #${d.id}</h3>
        ${devForm(d)}
        <div style="display:flex;gap:8px">
          <button id="save">Сохранить</button>
          <button id="back">Назад</button>
        </div>
      `;
      document.getElementById("back").onclick = () => renderAdmin(requestFilter);
      document.getElementById("save").onclick = async () => {
        const form = readForm();
        const err = validateForm(form);
        if (err) return alert(err);
        await api(`/api/admin/developers/${d.id}`, { method: "PUT", body: JSON.stringify(form) });
        await renderAdmin(requestFilter);
      };
    };
  });

  reqs.forEach((r) => {
    const btn = document.querySelector(`[data-mark="${r.id}"]`);
    if (!btn) return;
    btn.onclick = async () => {
      await api(`/api/admin/contact-requests/${r.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "processed" }),
      });
      await renderAdmin(requestFilter);
    };
  });
}

renderAdmin().catch((e) => {
  root.innerHTML = `<div>Ошибка: ${esc(e.message || String(e))}</div>`;
});
