const state = {
  page: 1,
  pageSize: 24,
  totalFiltered: 0,
  totalAll: 0,
};

const { api, esc } = window.ITBaseCommon;

const els = {
  search: document.getElementById("search"),
  grade: document.getElementById("grade"),
  sort: document.getElementById("sort"),
  list: document.getElementById("list"),
  peopleCount: document.getElementById("people-count"),
  countJunior: document.getElementById("count-junior"),
  countMiddle: document.getElementById("count-middle"),
  countSenior: document.getElementById("count-senior"),
  countLead: document.getElementById("count-lead"),
  pageLabel: document.getElementById("page-label"),
  prev: document.getElementById("prev-page"),
  next: document.getElementById("next-page"),
};

function renderCard(dev, withActions = true) {
  const skills = (dev.skills || []).slice(0, 8).map((x) => `<span>${esc(x)}</span>`).join(", ");
  const cardId = `dev-${dev.id}`;
  return `
    <article class="card" id="${cardId}">
      <h3>${esc(dev.name)}</h3>
      <div class="muted">${esc(dev.title)}</div>
      <div style="margin: 6px 0;"><span class="grade ${dev.grade}">${dev.grade}</span></div>
      <div class="card-text"><b>Стек:</b> <span class="line-clamp">${esc(dev.stack || "-")}</span></div>
      <div class="card-text"><b>Навыки:</b> <span class="line-clamp">${skills || "-"}</span></div>
      <div class="card-text"><b>Опыт:</b> <span class="line-clamp">${esc(dev.experience || "-")}</span></div>
      <div class="card-extra">
        <div><b>Полный стек:</b> ${esc(dev.stack || "-")}</div>
        <div><b>Полные навыки:</b> ${skills || "-"}</div>
        <div><b>Полный опыт:</b> ${esc(dev.experience || "-")}</div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn-expand is-hidden" data-expand="${dev.id}">Развернуть</button>
      ${
        withActions
          ? `<button type="button" data-contact="${dev.id}">Связаться</button>`
          : ""
      }
      </div>
    </article>
  `;
}

function formatGradeCount(part, total) {
  const p = total > 0 ? Math.round((part / total) * 100) : 0;
  return `${part} (${p}%)`;
}

async function loadList() {
  const statsData = await api("/api/public/stats");
  state.totalAll = Number(statsData.total || 0);
  const params = new URLSearchParams({
    query: els.search.value.trim(),
    grade: els.grade.value,
    sort: els.sort.value,
    page: String(state.page),
    page_size: String(state.pageSize),
  });
  const data = await api(`/api/public/developers?${params.toString()}`);
  state.totalFiltered = data.total;
  const pages = Math.max(1, Math.ceil(state.totalFiltered / state.pageSize));
  state.page = Math.min(state.page, pages);
  if (els.peopleCount) {
    els.peopleCount.textContent = `Людей в базе: ${state.totalAll}`;
  }
  if (els.countJunior) els.countJunior.textContent = formatGradeCount(Number(statsData.by_grade?.Junior || 0), state.totalAll);
  if (els.countMiddle) els.countMiddle.textContent = formatGradeCount(Number(statsData.by_grade?.Middle || 0), state.totalAll);
  if (els.countSenior) els.countSenior.textContent = formatGradeCount(Number(statsData.by_grade?.Senior || 0), state.totalAll);
  if (els.countLead) els.countLead.textContent = formatGradeCount(Number(statsData.by_grade?.Lead || 0), state.totalAll);
  document.querySelectorAll("[data-grade-chip]").forEach((chip) => {
    const chipGrade = chip.getAttribute("data-grade-chip") || "";
    chip.classList.toggle("active", chipGrade === els.grade.value);
  });
  els.pageLabel.textContent = `Страница ${state.page} / ${pages}`;
  els.list.innerHTML = data.items.map((x) => renderCard(x)).join("");
  wireContactButtons();
  wireExpandButtons();
}

function wireContactButtons() {
  document.querySelectorAll("[data-contact]").forEach((btn) => {
    btn.onclick = async () => {
      const developerId = Number(btn.getAttribute("data-contact"));
      const tg = prompt("Ваш Telegram (формат @username):", "@");
      if (!tg) return;
      const message = prompt("Комментарий (опционально):", "") || "";
      await api("/api/public/contact-requests", {
        method: "POST",
        body: JSON.stringify({ developer_id: developerId, customer_telegram: tg, message }),
      });
      alert("Запрос отправлен администратору.");
    };
  });
}

function wireExpandButtons() {
  document.querySelectorAll("[data-expand]").forEach((btn) => {
    const card = btn.closest(".card");
    if (!card) return;
    const clamped = Array.from(card.querySelectorAll(".line-clamp"));
    const hasOverflow = clamped.some((el) => el.scrollHeight > el.clientHeight + 1);
    btn.classList.toggle("is-hidden", !hasOverflow);

    btn.onclick = () => {
      if (!card) return;
      const expanded = card.classList.toggle("is-expanded");
      btn.textContent = expanded ? "Свернуть" : "Развернуть";
    };
  });
}


els.search.oninput = () => {
  state.page = 1;
  loadList();
};
els.grade.onchange = () => {
  state.page = 1;
  loadList();
};
els.sort.onchange = () => {
  state.page = 1;
  loadList();
};
document.querySelectorAll("[data-grade-chip]").forEach((chip) => {
  chip.onclick = () => {
    const chipGrade = chip.getAttribute("data-grade-chip") || "";
    els.grade.value = els.grade.value === chipGrade ? "" : chipGrade;
    state.page = 1;
    loadList();
  };
});
els.prev.onclick = () => {
  state.page = Math.max(1, state.page - 1);
  loadList();
};
els.next.onclick = () => {
  const pages = Math.max(1, Math.ceil(state.totalFiltered / state.pageSize));
  state.page = Math.min(pages, state.page + 1);
  loadList();
};
(async function boot() {
  await loadList();
})();
