/* 老字号 OPC 对接平台 V9 — 首页 / 企业需求库 / 提交企业需求（对话流＋单向入库） / 企业页 / 深度需求 */
(function () {
  const $app = document.getElementById("app");

  /* ---------- 工具 ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const findCo = (id) => COMPANIES.find((c) => c.id === id);
  const allIndustries = () => [...new Set(COMPANIES.flatMap((c) => c.industries))];

  /* 待审核库（localStorage，单向：挖掘页 → 主页/实验室） */
  const store = {
    get pending() { try { return JSON.parse(localStorage.getItem("lni-pending") || "[]"); } catch { return []; } },
    set pending(v) { localStorage.setItem("lni-pending", JSON.stringify(v)); },
    get intake() { try { return JSON.parse(localStorage.getItem("lni-intake") || "null"); } catch { return null; } },
    set intake(v) { localStorage.setItem("lni-intake", JSON.stringify(v)); },
    get feedback() { try { return JSON.parse(localStorage.getItem("lni-feedback") || "null"); } catch { return null; } },
    set feedback(v) { localStorage.setItem("lni-feedback", JSON.stringify(v)); }
  };
  const allNeeds = () => COMPANIES.flatMap((c) => c.needs.filter((n) => n.visible).map((n) => ({ ...n, co: c })));
  const pendingNeeds = () => store.pending.flatMap((p) => p.needs.map((n) => ({ ...n, co: p.co, pending: true })));

  const lvBadge = (lv) => lv && LEVELS[lv] ? `<span class="badge b-${LEVELS[lv].color}" title="${esc(LEVELS[lv].desc)}">${LEVELS[lv].name}</span>` : "";
  const modeBadge = (m) => m && MODES[m] ? `<span class="badge b-line" title="${esc(MODES[m].desc)}">${MODES[m].name}</span>` : "";
  const remoteTag = (m) => m === "F" || m === "S" ? `<span class="tag tag-onsite">需到场</span>` : `<span class="tag tag-remote">可远程</span>`;
  const coMark = (c, cls) => c.logo
    ? `<div class="co-mark co-logo ${cls || ""}"><img src="${esc(c.logo)}" alt="${esc(c.name)}" onerror="this.parentElement.textContent='${esc(c.name[0])}'"/></div>`
    : `<div class="co-mark ${cls || ""}">${esc(c.name[0])}</div>`;

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2000);
  }
  window.toast = toast; // 供内联事件使用

  /* ---------- 对接弹窗 ---------- */
  function openContact(needId, coName) {
    const old = document.getElementById("modal-mask");
    if (old) old.remove();
    const mask = document.createElement("div");
    mask.id = "modal-mask";
    mask.className = "modal-mask";
    mask.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <h3>申请对接</h3>
        <p>需求编号：<b>${esc(needId)}</b>（${esc(coName)}）</p>
        <p>请联系管理员发起对接：</p>
        <p class="modal-contact">大狐 · 微信号：<b>Mrfox0425</b></p>
        <p class="modal-note">暂不支持线上直接成交，对接意向由平台人工确认后安排双方沟通。</p>
        <button class="btn dark" id="modal-close">知道了</button>
      </div>`;
    mask.onclick = (e) => { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
    document.getElementById("modal-close").onclick = () => mask.remove();
  }

  /* ---------- 骨架 ---------- */
  function shell(content, active) {
    return `
    <div class="app">
      <header class="topbar">
        <div class="brand" onclick="location.hash='#/'">
          <div class="brand-mark">老</div>
          <div><div class="brand-name">老字号 OPC 对接平台</div><div class="brand-sub">企业需求 × OPC 人才 双向对接</div></div>
        </div>
        <nav class="nav">
          <button class="${active === "home" ? "active" : ""}" onclick="location.hash='#/'">首页</button>
          <button class="${active === "lab" ? "active" : ""}" onclick="location.hash='#/lab'">企业需求库</button>
          <button class="${active === "talents" ? "active" : ""}" onclick="location.hash='#/talents'">OPC 人才库</button>
          <button class="${active === "dig" ? "active" : ""}" onclick="location.hash='#/dig'">提交企业需求</button>
        </nav>
      </header>
      ${content}
      <footer class="site-footer">
        <b>老字号 OPC 对接平台</b>
        <p>需求条目源自企业访谈纪要拆解，每条附原文引述。预算与周期以面谈为准。对接请通过平台发起。</p>
      </footer>
    </div>`;
  }

  /* ---------- 主页 ---------- */
  function homePage() {
    const needs = allNeeds();
    const pending = store.pending;
    const body = `
    <main class="page">
      <section class="hero">
        <div class="eyebrow">老字号 OPC 对接平台</div>
        <h1>一头连着企业的真需求，<br/>一头连着 OPC 的<span class="hl">真本事</span>。</h1>
        <p class="lead">这里收录首批调研企业的真实需求。每一条都来自访谈原话，按需求领域与场景归位。</p>
        <div class="hero-stats">
          <div class="stat s1"><b>${COMPANIES.length}</b><span>调研企业</span></div>
          <div class="stat s2"><b>${needs.length}</b><span>在库需求</span></div>
          <div class="stat s3"><b>${needs.filter((n) => n.trinity === "life").length}</b><span>紧急需求</span></div>
          ${pending.length ? `<div class="stat s4"><b>${pending.length}</b><span>审核中（线上提交）</span></div>` : ""}
        </div>
      </section>
      <section class="entry-grid">
        <div class="entry-card" onclick="location.hash='#/lab'">
          <span class="entry-kicker">需求侧</span>
          <h2>企业需求库</h2>
          <p>首批 ${COMPANIES.length} 家老字号 · ${needs.length} 条结构化需求，按行业、领域、场景检索</p>
          <b>进入 →</b>
        </div>
        <div class="entry-card entry-alt" onclick="location.hash='#/talents'">
          <span class="entry-kicker">供给侧</span>
          <h2>OPC 人才库</h2>
          <p>全国 AI 人才可信档案：按能力标签、城市、案例与权威报道查证能落地的 OPC</p>
          <b>进入 →</b>
        </div>
      </section>
      <section class="co-grid">
        ${COMPANIES.map((c) => {
          const vis = c.needs.filter((n) => n.visible);
          return `
          <article class="co-card" onclick="location.hash='#/co/${c.id}'">
            <div class="co-head">
              ${coMark(c)}
              <div><h2>${esc(c.name)}</h2><small>${esc(c.company)}</small></div>
            </div>
            <div class="co-tags">${c.industries.map((i) => `<span class="tag ind">${i}</span>`).join("")}</div>
            <p class="co-sum">${esc(c.overview)}</p>
            <div class="co-foot"><span><b>${vis.length}</b> 条需求</span><span class="co-enter">查看 →</span></div>
          </article>`;
        }).join("")}
        ${pending.map((p) => `
          <article class="co-card pending" onclick="toast('该企业条目正在平台审核中')">
            <div class="co-head">
              <div class="co-mark">${esc(p.co.name[0])}</div>
              <div><h2>${esc(p.co.name)}</h2><small>${esc(p.co.industries.join(" / ") || "行业待确认")}</small></div>
            </div>
            <div class="co-tags"><span class="tag tag-pending">审核中</span><span class="tag lay">线上提交</span></div>
            <p class="co-sum">${esc(p.co.overview)}</p>
            <div class="co-foot"><span><b>${p.needs.length}</b> 条需求草案</span><span>待审核</span></div>
          </article>`).join("")}
      </section>
    </main>`;
    $app.innerHTML = shell(body, "home");
    window.scrollTo(0, 0);
  }

  /* ---------- 企业需求库 ---------- */
  const state = { industry: "", domain: "", scene: "", level: "", remote: "", kw: "" };

  function labPage() {
    const body = `
    <main class="page">
      <section class="hero" style="padding-bottom:8px">
        <div class="eyebrow">企业需求库</div>
        <h1 style="font-size:clamp(30px,4vw,46px)">企业需求库</h1>
      </section>
      <div class="lab-filter">
        <div class="chip-row"><span class="chip-label">行业</span>
          <div class="chips" id="chips-ind">
            <button class="chip ${!state.industry ? "on" : ""}" data-v="">全部</button>
            ${allIndustries().map((i) => `<button class="chip ${state.industry === i ? "on" : ""}" data-v="${i}">${i}</button>`).join("")}
          </div>
        </div>
        <div class="chip-row"><span class="chip-label">需求领域</span>
          <div class="chips" id="chips-dom">
            <button class="chip ${!state.domain ? "on" : ""}" data-v="">全部</button>
            ${Object.keys(DOMAINS).map((d) => `<button class="chip ${state.domain === d ? "on" : ""}" data-v="${d}">${d}</button>`).join("")}
          </div>
        </div>
        <div class="chip-row"><span class="chip-label">应用场景</span>
          <div class="chips" id="chips-scn"></div>
        </div>
        <div class="chip-row"><span class="chip-label">交付级别</span>
          <div class="chips" id="chips-lv">
            <button class="chip ${!state.level ? "on" : ""}" data-v="">全部</button>
            ${Object.entries(LEVELS).map(([k, v]) => `<button class="chip ${state.level === k ? "on" : ""}" data-v="${k}">${v.name}</button>`).join("")}
          </div>
        </div>
        <div class="chip-row"><span class="chip-label">协作方式</span>
          <div class="chips" id="chips-rm">
            <button class="chip ${!state.remote ? "on" : ""}" data-v="">全部</button>
            <button class="chip ${state.remote === "remote" ? "on" : ""}" data-v="remote">可远程</button>
            <button class="chip ${state.remote === "onsite" ? "on" : ""}" data-v="onsite">需到场</button>
          </div>
        </div>
        <div class="chip-row"><span class="chip-label">关键词</span>
          <input id="f-kw" class="kw" placeholder="搜需求 / 企业…" value="${esc(state.kw)}"/>
        </div>
      </div>
      <p class="lab-count" id="lab-count"></p>
      <section class="need-grid" id="lab-grid"></section>
    </main>`;
    $app.innerHTML = shell(body, "lab");
    document.getElementById("chips-ind").onclick = (e) => { chipPick(e, "industry"); renderLab(); };
    document.getElementById("chips-dom").onclick = (e) => { chipPick(e, "domain"); state.scene = ""; renderSceneChips(); renderLab(); };
    document.getElementById("chips-scn").onclick = (e) => { chipPick(e, "scene"); renderLab(); };
    document.getElementById("chips-lv").onclick = (e) => { chipPick(e, "level"); renderLab(); };
    document.getElementById("chips-rm").onclick = (e) => { chipPick(e, "remote"); renderLab(); };
    document.getElementById("f-kw").oninput = (e) => { state.kw = e.target.value.trim(); renderLab(); };
    renderSceneChips();
    renderLab();
    window.scrollTo(0, 0);
  }

  function chipPick(e, key) {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state[key] = btn.dataset.v;
    btn.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === btn));
  }

  function renderSceneChips() {
    const scenes = state.domain ? DOMAINS[state.domain] : [...new Set(Object.values(DOMAINS).flat())];
    if (state.scene && !scenes.includes(state.scene)) state.scene = "";
    document.getElementById("chips-scn").innerHTML =
      `<button class="chip ${!state.scene ? "on" : ""}" data-v="">全部</button>` +
      scenes.map((s) => `<button class="chip ${state.scene === s ? "on" : ""}" data-v="${s}">${s}</button>`).join("");
  }

  function matchNeed(n) {
    if (state.industry && !n.co.industries.includes(state.industry)) return false;
    if (state.domain && n.domain !== state.domain) return false;
    if (state.scene && n.scene !== state.scene) return false;
    if (state.level && n.level !== state.level) return false;
    if (state.remote === "onsite" && !(n.mode === "F" || n.mode === "S")) return false;
    if (state.remote === "remote" && (n.mode === "F" || n.mode === "S")) return false;
    if (state.kw) {
      const hay = (n.title + n.quote + n.co.name + n.co.company).toLowerCase();
      if (!hay.includes(state.kw.toLowerCase())) return false;
    }
    return true;
  }

  function needCard(n) {
    const foot = n.pending
      ? `<div class="need-foot"><span class="status-pending">审核中 · 暂不可对接</span></div>`
      : `<div class="need-foot"><span class="status-open">可对接</span><button class="btn acid sm btn-contact" data-id="${esc(n.id)}" data-co="${esc(n.co.name)}">申请对接</button></div>`;
    return `
    <article class="need-card${n.pending ? " pending" : ""}" ${n.pending ? "" : `onclick="location.hash='#/co/${n.co.id}/depth'"`}>
      <div class="need-head"><span class="need-id">${esc(n.co.name)}</span><h3>${esc(n.title)} <small class="need-code">${esc(n.id)}</small></h3></div>
      <div class="need-meta">${lvBadge(n.level)}${n.goal ? `<span class="goal-chip">${esc(n.goal)}</span>` : ""}${remoteTag(n.mode)}${n.pending ? '<span class="tag tag-pending">审核中</span>' : ""}</div>
      <div class="need-quote"><b>${n.pending ? "企业自检提交 · " : "访谈原话 · "}${esc(n.co.name)}</b>「${esc(n.quote)}」</div>
      <div class="need-body">
        <div class="row"><b>平台建议</b>${esc(n.suggestion)}</div>
        <div class="row two-col"><span><b>企业预算</b>${esc(n.budget)}</span><span><b>预计周期</b>${esc(n.period)}</span></div>
      </div>
      ${foot}
    </article>`;
  }

  function bindContact(root) {
    (root || document).querySelectorAll(".btn-contact").forEach((b) => {
      b.onclick = (e) => { e.stopPropagation(); openContact(b.dataset.id, b.dataset.co); };
    });
  }

  function renderLab() {
    const list = [...allNeeds(), ...pendingNeeds()].filter(matchNeed);
    document.getElementById("lab-count").textContent = `共 ${list.length} 条需求`;
    document.getElementById("lab-grid").innerHTML = list.length
      ? list.map(needCard).join("")
      : `<p style="grid-column:1/-1;color:var(--muted)">没有命中的需求，请放宽筛选条件。</p>`;
    bindContact(document.getElementById("lab-grid"));
  }

  /* ============================================================
     企业需求挖掘（对话流）
     流程：弹窗问卷（含保密声明）→ 对话流（快速处理 / 深度挖掘）→ 需求草案提交审核（单向入库）
     ============================================================ */
  let chat = [];
  let quizQueue = [];
  let quizHits = {};
  let quizMultiSel = [];
  let deepPath = [];
  let deepNode = "start";
  let history = [];        // 屏级快照：{label, chatLen, quizQueue, quizHits, deepNode, deepPath}
  let customNotes = [];    // 用户自由输入的补充
  let lastOpts = null;     // 当前待选选项（页面往返后恢复）
  let currentCtx = null;   // 当前进行中的题目上下文 {type:'quiz',qi} | {type:'deep'}

  function digPage() {
    const intake = store.intake;
    const body = `
    <main class="page">
      <section class="hero" style="padding-bottom:8px">
        <div class="eyebrow">提交企业需求</div>
        <h1 style="font-size:clamp(30px,4vw,46px)">提交企业需求</h1>
      </section>
      <div class="chat-shell">
        <div class="chat-nav" id="chat-nav"></div>
        <div class="chat-topbar">
          <span>${intake ? `当前企业：<b>${esc(intake.name)}</b>（${esc(intake.industries.join("/") || "行业待确认")} · ${esc(intake.scale)}）` : "尚未填写企业信息"}</span>
          <span>
            <button class="btn sm" id="dig-intake">${intake ? "修改企业信息" : "填写企业信息"}</button>
            <button class="btn sm" id="dig-restart">重新开始</button>
          </span>
        </div>
        <div class="chat-flow" id="chat-flow"></div>
        <div class="chat-inputbar">
          <input id="chat-bar" placeholder="继续对话：直接输入您的想法、补充或新问题…"/>
          <button class="btn dark sm" id="chat-bar-send">发送</button>
        </div>
      </div>
    </main>`;
    $app.innerHTML = shell(body, "dig");
    document.getElementById("dig-intake").onclick = openIntake;
    document.getElementById("dig-restart").onclick = () => { chat = []; deepPath = []; deepNode = "start"; quizHits = {}; history = []; customNotes = []; currentCtx = null; lastOpts = null; digPage(); };
    const bar = document.getElementById("chat-bar");
    document.getElementById("chat-bar-send").onclick = barSend;
    bar.onkeydown = (e) => { if (e.key === "Enter") barSend(); };
    renderChatNav();
    if (!intake) { openIntake(); return; }
    if (!chat.length) {
      botSay(`已收到贵司信息。接下来可选两种方式：<br><b>快速处理</b>——10 个选择题，3 分钟出初步判断；<br><b>深度挖掘</b>——连续追问，逐步定位真实病灶。`);
      askMode();
    } else {
      renderChat();
      if (lastOpts) showOptions(lastOpts);
    }
    window.scrollTo(0, 0);
  }

  /* ----- 弹窗问卷：企业信息收集 ----- */
  function openIntake() {
    const old = document.getElementById("modal-mask");
    if (old) old.remove();
    const cur = store.intake || {};
    const mask = document.createElement("div");
    mask.id = "modal-mask";
    mask.className = "modal-mask";
    mask.innerHTML = `
      <div class="modal modal-lg" role="dialog" aria-modal="true">
       <div id="fi-view-form">
        <h3>企业信息登记</h3>
        <p class="modal-privacy">您填写的信息仅用于平台需求诊断。我们将为您保密，不会泄露至任何第三方平台。</p>
        <label class="f-row"><span>企业名称 *</span><input id="fi-name" class="kw" style="max-width:none;width:100%" value="${esc(cur.name || "")}" placeholder="如：某某食品有限公司"/></label>
        <div class="f-row"><span>所属行业（可多选）</span>
          <div class="chips" id="fi-inds">${[...allIndustries(), "其他"].map((i) => `<button class="chip" data-v="${i}">${i}</button>`).join("")}</div>
        </div>
        <label class="f-row"><span>所在地</span><input id="fi-city" class="kw" style="max-width:none;width:100%" value="${esc(cur.city || "上海")}"/></label>
        <label class="f-row"><span>企业规模</span>
          <select id="fi-scale" class="kw" style="width:100%">
            ${["50人以下", "50–200人", "200–1000人", "1000人以上"].map((s) => `<option ${cur.scale === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <div class="f-row"><span>当前最明显的痛点方向（可多选）</span>
          <div class="chips" id="fi-pains">${[...Object.keys(DOMAINS), "说不清"].map((d) => `<button class="chip" data-v="${d}">${d}</button>`).join("")}</div>
        </div>
        <button class="btn dark" id="fi-submit" style="width:100%;margin-top:14px">提交并开始诊断</button>
        <button class="btn sm" id="fi-outline" style="width:100%;margin-top:8px">暂不填写，看看问题大纲</button>
       </div>
       <div id="fi-view-outline" style="display:none">
        <h3>问题大纲</h3>
        <p class="modal-privacy">填写信息登记后，咨询助手将按以下大纲与您逐一确认；您也可以先浏览大纲，再回来登记。</p>
        <p style="margin:12px 0 6px"><b>快速处理 · 10 题速答</b></p>
        <ol class="fi-ol">${QUIZ.map((q) => `<li>${esc(q.q)}</li>`).join("")}</ol>
        <p style="margin:12px 0 6px"><b>深度挖掘 · 连续追问</b></p>
        <p class="fi-desc">从"当前最头疼的事"开始逐层追问（卖不动／成本效率／缺人缺能力／品牌没人知道），直至定位病灶并给出承接建议。</p>
        <button class="btn dark" id="fi-backform" style="width:100%;margin-top:14px">我已了解，去填写企业信息</button>
        <button class="btn sm" id="fi-tofeedback" style="width:100%;margin-top:8px">我有建议，大纲需要调整</button>
       </div>
       <div id="fi-view-feedback" style="display:none">
        <h3>大纲建议</h3>
        <p class="modal-privacy">逐题勾选您同意回答的问题；如有优化想法，写在对应问题旁。提交后，咨询助手将按您的建议调整访谈。</p>
        <p style="margin:12px 0 6px"><b>快速处理 · 逐题确认</b></p>
        <div id="fi-fb-list">
          ${QUIZ.map((q, i) => `
          <div class="fi-fb-row">
            <label class="fi-fb-check"><input type="checkbox" data-qi="${i}" checked/> 同意</label>
            <div class="fi-fb-main">
              <div class="fi-fb-q">${i + 1}. ${esc(q.q)}</div>
              <input class="chat-input fi-fb-note" data-qi="${i}" placeholder="我认为可以按照这方面优化…"/>
            </div>
          </div>`).join("")}
        </div>
        <p style="margin:12px 0 6px"><b>整体建议</b></p>
        <textarea id="fi-fb-overall" class="fi-fb-text" placeholder="我的建议是…"></textarea>
        <p style="margin:12px 0 6px"><b>深度挖掘 · 建议</b></p>
        <textarea id="fi-fb-deep" class="fi-fb-text" placeholder="关于连续追问的方式，我的建议是…"></textarea>
        <button class="btn dark" id="fi-fb-submit" style="width:100%;margin-top:12px">提交我的建议</button>
        <button class="btn sm" id="fi-fb-back" style="width:100%;margin-top:8px">返回问题大纲</button>
       </div>
      </div>`;
    document.body.appendChild(mask);
    mask.onclick = (e) => { if (e.target === mask) mask.remove(); };
    mask.querySelector("#fi-outline").onclick = () => {
      mask.querySelector("#fi-view-form").style.display = "none";
      mask.querySelector("#fi-view-outline").style.display = "";
    };
    mask.querySelector("#fi-backform").onclick = () => {
      mask.querySelector("#fi-view-outline").style.display = "none";
      mask.querySelector("#fi-view-form").style.display = "";
    };
    const showView = (v) => ["fi-view-form", "fi-view-outline", "fi-view-feedback"].forEach((id) => {
      mask.querySelector("#" + id).style.display = id === v ? "" : "none";
    });
    mask.querySelector("#fi-outline").onclick = () => showView("fi-view-outline");
    mask.querySelector("#fi-backform").onclick = () => showView("fi-view-form");
    mask.querySelector("#fi-tofeedback").onclick = () => showView("fi-view-feedback");
    mask.querySelector("#fi-fb-back").onclick = () => showView("fi-view-outline");
    mask.querySelector("#fi-fb-submit").onclick = () => {
      const agreed = [];
      const notes = {};
      mask.querySelectorAll("#fi-fb-list input[type=checkbox]").forEach((c) => { if (c.checked) agreed.push(+c.dataset.qi); });
      mask.querySelectorAll(".fi-fb-note").forEach((inp) => { const v = inp.value.trim(); if (v) notes[inp.dataset.qi] = v; });
      store.feedback = {
        agreed,
        notes,
        overall: mask.querySelector("#fi-fb-overall").value.trim(),
        deep: mask.querySelector("#fi-fb-deep").value.trim()
      };
      toast("已收到您的大纲建议，访谈将按此调整");
      showView("fi-view-form");
    };

    const picks = { inds: new Set(cur.industries || []), pains: new Set(cur.pains || []) };
    const paint = (id, set) => mask.querySelectorAll(`#${id} .chip`).forEach((c) => c.classList.toggle("on", set.has(c.dataset.v)));
    paint("fi-inds", picks.inds); paint("fi-pains", picks.pains);
    mask.querySelectorAll("#fi-inds .chip").forEach((c) => c.onclick = () => { picks.inds.has(c.dataset.v) ? picks.inds.delete(c.dataset.v) : picks.inds.add(c.dataset.v); paint("fi-inds", picks.inds); });
    mask.querySelectorAll("#fi-pains .chip").forEach((c) => c.onclick = () => { picks.pains.has(c.dataset.v) ? picks.pains.delete(c.dataset.v) : picks.pains.add(c.dataset.v); paint("fi-pains", picks.pains); });

    mask.querySelector("#fi-submit").onclick = () => {
      const name = mask.querySelector("#fi-name").value.trim();
      if (!name) { toast("请填写企业名称"); return; }
      store.intake = {
        name,
        industries: [...picks.inds],
        city: mask.querySelector("#fi-city").value.trim() || "上海",
        scale: mask.querySelector("#fi-scale").value,
        pains: [...picks.pains]
      };
      mask.remove();
      chat = []; deepPath = []; deepNode = "start"; quizHits = {};
      digPage();
    };
  }

  /* ----- 对话流基础 ----- */
  function renderChat() {
    const flow = document.getElementById("chat-flow");
    if (!flow) return;
    flow.innerHTML = chat.map((m) => `<div class="msg ${m.from}">${m.html}</div>`).join("");
    flow.scrollTop = flow.scrollHeight;
  }
  function botSay(html, opts) {
    chat.push({ from: "bot", html });
    renderChat();
    if (opts && opts.length) showOptions(opts);
  }
  function userSay(text) {
    chat.push({ from: "user", html: esc(text) });
    renderChat();
  }
  function showOptions(opts, allowText, ctx) {
    const flow = document.getElementById("chat-flow");
    if (!flow) return;
    lastOpts = opts;
    const div = document.createElement("div");
    div.className = "chat-opts";
    div.innerHTML = opts.map((o, i) => `<button class="chip" data-i="${i}">${esc(o.t)}</button>`).join("") +
      (allowText ? `<div class="chat-input-row"><input class="chat-input" placeholder="其他想法？直接输入，点发送"/><button class="chip chip-confirm chat-send">发送</button></div>` : "");
    flow.appendChild(div);
    flow.scrollTop = flow.scrollHeight;
    div.querySelectorAll(".chip[data-i]").forEach((b) => b.onclick = () => { div.remove(); lastOpts = null; opts[+b.dataset.i].fn(); });
    const send = div.querySelector(".chat-send");
    if (send) send.onclick = () => {
      const inp = div.querySelector(".chat-input");
      const v = inp.value.trim();
      if (!v) { toast("请输入内容"); return; }
      div.remove();
      userSay(v);
      onFreeText(v, ctx);
    };
  }

  /* ----- 屏级历史：返回上一屏 / 回到第N屏 ----- */
  function pushHistory(label) {
    history.push({ label, chatLen: chat.length, quizQueue: [...quizQueue], quizHits: { ...quizHits }, deepNode, deepPath: [...deepPath] });
    renderChatNav();
  }
  function restoreHistory(i) {
    const s = history[i];
    if (!s) return;
    history = history.slice(0, i);
    chat = chat.slice(0, s.chatLen);
    quizQueue = [...s.quizQueue];
    quizHits = { ...s.quizHits };
    deepNode = s.deepNode;
    deepPath = [...s.deepPath];
    renderChat();
    renderChatNav();
    if (quizQueue.length) showQuizOptions(quizQueue[0]);
    else showDeepOptions(TREE[deepNode]);
  }
  function renderChatNav() {
    const nav = document.getElementById("chat-nav");
    if (!nav) return;
    if (!history.length) { nav.innerHTML = ""; return; }
    nav.innerHTML = `
      <button class="chat-nav-btn" id="nav-prev" ${history.length < 2 ? "disabled" : ""}>← 返回上一屏</button>
      <select id="nav-jump" class="chat-nav-select">
        <option value="">回到第N屏…</option>
        ${history.map((h, i) => `<option value="${i}">第${i + 1}屏 · ${esc(h.label)}</option>`).join("")}
      </select>`;
    const prev = document.getElementById("nav-prev");
    if (prev && history.length >= 2) prev.onclick = () => restoreHistory(history.length - 2);
    document.getElementById("nav-jump").onchange = (e) => { if (e.target.value !== "") restoreHistory(+e.target.value); };
  }

  /* ----- 自由输入处理 ----- */
  function onFreeText(text, ctx) {
    currentCtx = null;
    if (ctx && ctx.type === "quiz") {
      customNotes.push(`第${ctx.qi + 1}题补充：${text}`);
      quizQueue.shift();
      setTimeout(askQuiz, 200);
    } else if (ctx && ctx.type === "deep") {
      customNotes.push(`追问补充：${text}`);
      botSay("已记录您的补充。这个方向比较个性化，建议由平台顾问直接对接诊断；也可以继续按选项回答当前问题。", [
        { t: "预约平台诊断", fn: () => { userSay("预约平台诊断"); openContact("深度诊断预约", "企业自检"); } },
        { t: "继续按选项回答", fn: () => showDeepOptions(TREE[deepNode]) }
      ]);
    }
  }

  /* ----- 常驻输入栏：随时可继续对话 ----- */
  function barSend() {
    const bar = document.getElementById("chat-bar");
    if (!bar) return;
    const v = bar.value.trim();
    if (!v) return;
    bar.value = "";
    userSay(v);
    if (currentCtx) {
      // 正在答题：视为该题的自由补充
      onFreeText(v, currentCtx);
    } else {
      // 无进行中的问题：记录补充并给下一步引导
      customNotes.push("自由补充：" + v);
      botSay("已收到您的补充（会随需求草案一并记录）。接下来您可以：", [
        { t: "深度挖掘一个新问题", fn: () => { startDeep(); } },
        { t: "快速处理（10 题速答）", fn: () => { startQuiz(); } },
        { t: "预约平台顾问", fn: () => { openContact("深度诊断预约", "企业自检"); } }
      ]);
    }
  }

  /* ----- 模式选择 ----- */
  function askMode() {
    showOptions([
      { t: "快速处理（3 分钟）", fn: () => { userSay("快速处理"); startQuiz(); } },
      { t: "深度挖掘（连续追问）", fn: () => { userSay("深度挖掘"); startDeep(); } }
    ]);
  }

  /* ----- 快速处理 ----- */
  function startQuiz() {
    const fb = store.feedback;
    quizQueue = QUIZ.map((_, i) => i).filter((i) => !fb || fb.agreed.includes(i));
    quizHits = {};
    history = [];
    if (fb) {
      if (fb.overall) customNotes.push("大纲整体建议：" + fb.overall);
      Object.values(fb.notes || {}).forEach((v) => customNotes.push("逐题优化建议：" + v));
      botSay(`好，已按您的大纲建议调整提问（保留 ${quizQueue.length} 题）。逐题来。每题也可以直接输入自己的想法。`);
    } else {
      botSay("好，快速处理开始。共 10 题，逐题来。每题也可以直接输入自己的想法。");
    }
    setTimeout(askQuiz, 250);
  }
  function askQuiz() {
    if (!quizQueue.length) return finishQuiz();
    const qi = quizQueue[0];
    const item = QUIZ[qi];
    if (item.multi) botSay(`${qi + 1}. ${esc(item.q)}<br><small style="color:var(--muted)">可多选，选完点「确认」</small>`);
    else botSay(`${qi + 1}. ${esc(item.q)}`);
    pushHistory(`第${qi + 1}题`);
    showQuizOptions(qi);
  }
  function showQuizOptions(qi) {
    const item = QUIZ[qi];
    currentCtx = { type: "quiz", qi };
    if (item.multi) { showMultiOptions(item, qi); return; }
    showOptions(item.options.map((o, oi) => ({ t: o.t, fn: () => { currentCtx = null; userSay(o.t); answerQuiz(qi, oi); } })), true, { type: "quiz", qi });
  }
  function showMultiOptions(item, qi) {
    const flow = document.getElementById("chat-flow");
    const div = document.createElement("div");
    div.className = "chat-opts";
    quizMultiSel = [];
    div.innerHTML = item.options.map((o, i) => `<button class="chip" data-i="${i}">${esc(o.t)}</button>`).join("") +
      `<button class="chip chip-confirm">确认</button>` +
      `<div class="chat-input-row"><input class="chat-input" placeholder="其他想法？直接输入，点发送"/><button class="chip chip-confirm chat-send">发送</button></div>`;
    flow.appendChild(div);
    flow.scrollTop = flow.scrollHeight;
    div.querySelectorAll(".chip[data-i]").forEach((b) => b.onclick = () => {
      const i = +b.dataset.i;
      if (item.options[i].exclusive) quizMultiSel = quizMultiSel.includes(i) ? [] : [i];
      else quizMultiSel = quizMultiSel.includes(i) ? quizMultiSel.filter((x) => x !== i) : [...quizMultiSel.filter((x) => !item.options[x].exclusive), i];
      div.querySelectorAll(".chip[data-i]").forEach((x) => x.classList.toggle("on", quizMultiSel.includes(+x.dataset.i)));
    });
    div.querySelector(".chat-send").onclick = () => {
      const v = div.querySelector(".chat-input").value.trim();
      if (!v) { toast("请输入内容"); return; }
      div.remove();
      userSay(v);
      onFreeText(v, { type: "quiz", qi });
    };
    div.querySelector(".chip-confirm").onclick = () => {
      if (!quizMultiSel.length) { toast("请至少选一项"); return; }
      div.remove();
      userSay(quizMultiSel.map((i) => item.options[i].t).join("、"));
      answerQuiz(qi, quizMultiSel);
    };
  }
  function answerQuiz(qi, oi) {
    currentCtx = null;
    const item = QUIZ[qi];
    const arr = Array.isArray(oi) ? oi : [oi];
    if (item.multi && item.mapSkip) {
      const chosen = arr.map((i) => item.options[i].t);
      if (chosen.includes("以上都没做")) addHit(quizHits, item.mapSkip["以上都没做"]);
      else Object.keys(item.mapSkip).forEach((k) => {
        if (k !== "以上都没做" && !chosen.includes(k)) addHit(quizHits, item.mapSkip[k]);
      });
    } else {
      arr.forEach((i) => { if (item.options[i].hit) addHit(quizHits, item.options[i].hit); });
    }
    quizQueue.shift();
    setTimeout(askQuiz, 200);
  }
  function addHit(hits, pair) { hits[pair[0] + "|" + pair[1]] = true; }

  function finishQuiz() {
    currentCtx = null;
    const keys = Object.keys(quizHits);
    if (!keys.length) {
      botSay("已完成自检：从您的回答看，未发现明显缺口。如需进一步确认，可以试试深度挖掘。", [
        { t: "切换到深度挖掘", fn: () => { userSay("切换到深度挖掘"); startDeep(); } },
        { t: "重新填写", fn: () => { userSay("重新填写"); chat = []; digPage(); } }
      ]);
      return;
    }
    botSay(`初判完成。从您的回答看，贵司有 <b>${keys.length}</b> 个可关注点：`);
    keys.forEach((k, i) => {
      const [dom, scn] = k.split("|");
      const d = DIAG[k] || ["", ""];
      setTimeout(() => {
        chat.push({
          from: "bot",
          html: `<div class="diag-card"><div class="diag-tag">${esc(dom)} · ${esc(scn)}</div><p>${esc(d[0])}</p><p class="diag-opc">${esc(d[1])}</p></div>`
        });
        renderChat();
      }, 120 * (i + 1));
    });
    setTimeout(() => {
      const n = writeDraft(keys.map((k) => k.split("|")));
      botSay(`已根据本次自检生成 <b>${n} 条需求草案</b>并提交平台审核（当前为「审核中」状态）。现在起，可在「企业需求库」按企业名称或场景检索到它们。`, [
        { t: "还有其他问题，继续深度挖掘", fn: () => { userSay("继续深度挖掘"); startDeep(); } },
        { t: "去企业需求库查看", fn: () => { userSay("去企业需求库查看"); location.hash = "#/lab"; } },
        { t: "预约平台顾问", fn: () => { userSay("预约平台顾问"); openContact("深度诊断预约", "企业自检"); } }
      ]);
    }, 120 * (keys.length + 1) + 250);
  }

  /* ----- 深度挖掘 ----- */
  function startDeep() {
    deepPath = [];
    deepNode = "start";
    history = [];
    const fb = store.feedback;
    if (fb && fb.deep) customNotes.push("深度挖掘建议：" + fb.deep);
    botSay("好，我们一步一步来。先从最头疼的事开始。选项之外，也可以直接输入您的情况。");
    setTimeout(askDeep, 250);
  }
  function askDeep() {
    const node = TREE[deepNode];
    botSay(esc(node.q));
    pushHistory(node.q.slice(0, 14) + (node.q.length > 14 ? "…" : ""));
    showDeepOptions(node);
  }
  function showDeepOptions(node) {
    currentCtx = { type: "deep" };
    showOptions(node.options.map((o) => ({
      t: o.t,
      fn: () => {
        currentCtx = null;
        userSay(o.t);
        deepPath.push(o.t);
        if (o.next) { deepNode = o.next; setTimeout(askDeep, 250); }
        else finishDeep(o.result);
      }
    })), true, { type: "deep" });
  }
  function finishDeep(r) {
    currentCtx = null;
    const d = DIAG[r.domain + "|" + r.scene] || ["", "平台可对接对应场景的服务方。"];
    chat.push({
      from: "bot",
      html: `<div class="diag-card"><div class="diag-tag">病灶定位</div>
        <p class="diag-chain">追问路径：${esc(deepPath.join(" → "))}</p>
        <p><b>${esc(r.lesion)}</b></p>
        <p class="diag-opc">${esc(d[1])}</p></div>`
    });
    renderChat();
    setTimeout(() => {
      const n = writeDraft([[r.domain, r.scene]], r.lesion);
      botSay(`本结论为初判，已生成 <b>${n} 条需求草案</b>并提交平台审核（「审核中」状态，可在企业需求库检索到）。如果还有其他困扰，我们可以直接开始新一轮挖掘。`, [
        { t: "还有其他问题，继续挖掘", fn: () => { userSay("继续挖掘其他问题"); startDeep(); } },
        { t: "去企业需求库查看", fn: () => { userSay("去企业需求库查看"); state.domain = r.domain; state.scene = r.scene; location.hash = "#/lab"; } },
        { t: "预约平台顾问", fn: () => { userSay("预约平台顾问"); openContact("深度诊断预约", "企业自检"); } }
      ]);
    }, 300);
  }

  /* ----- 单向入库：生成需求草案（审核中） ----- */
  function writeDraft(pairs, lesionText) {
    const intake = store.intake;
    const coId = "draft-" + Date.now();
    const needs = pairs.map(([dom, scn], i) => ({
      id: "DRAFT-" + (i + 1),
      title: lesionText || ((DIAG[dom + "|" + scn] || [scn])[0]),
      domain: dom, scene: scn,
      quote: "企业线上自检提交，原文待平台访谈确认",
      level: "", mode: "", goal: "", trinity: "comp",
      suggestion: (DIAG[dom + "|" + scn] || ["", ""])[1],
      budget: "暂无 · 需面谈", period: "暂无 · 需面谈",
      visible: true
    }));
    // 去重：同企业＋同场景集合，替换旧草案而非叠加
    const sig = pairs.map((p) => p.join("|")).sort().join(";");
    const rest = store.pending.filter((p) => !(p.co.name === intake.name && p.sig === sig));
    const entry = {
      sig,
      co: {
        id: coId, name: intake.name, company: intake.name, industries: intake.industries,
        overview: `${intake.city} · ${intake.scale} · 线上自检提交的企业，待平台访谈补全信息。${customNotes.length ? " 补充说明：" + customNotes.join("；") + "。" : ""}`
      },
      needs
    };
    store.pending = [...rest, entry];
    return needs.length;
  }

  /* ---------- 企业页 ---------- */
  function companyPage(id) {
    const c = findCo(id);
    if (!c) return (location.hash = "#/");
    const visCount = c.needs.filter((n) => n.visible).length;
    const body = `
    <main class="page">
      <span class="backlink" onclick="location.hash='#/'">← 返回首页</span>
      <section class="co-hero">
        <div class="eyebrow" style="color:#c8cbe0">公开信息</div>
        <div class="co-hero-row">${coMark(c, "co-mark-lg")}<h1>${esc(c.name)}</h1></div>
        <div class="sub">
          ${c.industries.map((i) => `<span class="tag ind">${i}</span>`).join("")}
          <p style="margin:12px 0 0;max-width:760px;line-height:1.8">${esc(c.overview)}</p>
        </div>
      </section>
      <section class="dim-grid">
        ${Object.entries(c.public).map(([k, items]) => `
          <div class="dim-card">
            <h3>${esc(k)}<small>公开渠道</small></h3>
            <ul>${items.map((it) => `<li class="${it.includes("待") ? "tbd" : ""}">${esc(it.replace(/（量级待核实）/g, ""))}</li>`).join("")}</ul>
          </div>`).join("")}
      </section>
      <div class="depth-banner" onclick="location.hash='#/co/${c.id}/depth'">
        <div><h2>深度需求 · ${visCount} 条</h2><p>来自访谈纪要的结构化拆解</p></div>
        <span class="arrow">→</span>
      </div>
    </main>`;
    $app.innerHTML = shell(body, "");
    window.scrollTo(0, 0);
  }

  /* ---------- 深度需求页 ---------- */
  function depthPage(id) {
    const c = findCo(id);
    if (!c) return (location.hash = "#/");
    // 注意：needCard 依赖 n.co，此处必须挂载企业对象（V2–V4 缺失导致渲染崩溃的 bug 修复点）
    const vis = c.needs.filter((n) => n.visible).map((n) => ({ ...n, co: c }));
    const groups = {};
    vis.forEach((n) => { (groups[n.domain] = groups[n.domain] || []).push(n); });
    const body = `
    <main class="page">
      <span class="backlink" onclick="location.hash='#/co/${c.id}'">← 返回 ${esc(c.name)}</span>
      <section class="hero" style="padding-bottom:10px">
        <div class="eyebrow">深度需求</div>
        <h1 style="font-size:clamp(30px,4vw,48px)">${esc(c.name)} · 深度需求 <span class="hl">${vis.length} 条</span></h1>
      </section>
      ${Object.entries(groups).map(([dom, ns], gi) => `
        <section class="layer-sec">
          <div class="layer-head"><span class="layer-no">${String(gi + 1).padStart(2, "0")}</span><h2>${esc(dom)}</h2><small>${ns.length} 条</small></div>
          <div class="need-grid">${ns.map(needCard).join("")}</div>
        </section>`).join("")}
    </main>`;
    $app.innerHTML = shell(body, "");
    bindContact($app);
    window.scrollTo(0, 0);
  }

  /* ---------- OPC 人才库（原生页，数据源自合作方可信档案库） ---------- */
  const tstate = { tag: "", city: "", kw: "" };

  function talentsPage() {
    const tagCount = {}, cityCount = {};
    TALENTS.forEach((t) => {
      (t.tags || []).forEach((g) => { tagCount[g] = (tagCount[g] || 0) + 1; });
      cityCount[t.city] = (cityCount[t.city] || 0) + 1;
    });
    const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 14).map((x) => x[0]);
    const cities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 12).map((x) => x[0]);
    const body = `
    <main class="page">
      <section class="hero" style="padding-bottom:8px">
        <div class="eyebrow">OPC 人才库</div>
        <h1 style="font-size:clamp(30px,4vw,46px)">OPC 人才库</h1>
        <p class="lead" style="font-size:15px">合作方可信档案：每位人才均有公开来源与证据链。按能力标签、城市、关键词检索。</p>
        <div class="hero-stats">
          <div class="stat s1"><b>${TALENTS.length}</b><span>在库人才</span></div>
          <div class="stat s2"><b>${Object.keys(cityCount).length}</b><span>覆盖城市</span></div>
          <div class="stat s3"><b>${Object.keys(tagCount).length}</b><span>能力标签</span></div>
        </div>
      </section>
      <div class="lab-filter">
        <div class="chip-row"><span class="chip-label">能力标签</span>
          <div class="chips" id="chips-tag">
            <button class="chip ${!tstate.tag ? "on" : ""}" data-v="">全部</button>
            ${tags.map((g) => `<button class="chip ${tstate.tag === g ? "on" : ""}" data-v="${esc(g)}">${esc(g)}</button>`).join("")}
          </div>
        </div>
        <div class="chip-row"><span class="chip-label">城市</span>
          <div class="chips" id="chips-city">
            <button class="chip ${!tstate.city ? "on" : ""}" data-v="">全部</button>
            ${cities.map((c) => `<button class="chip ${tstate.city === c ? "on" : ""}" data-v="${c}">${c}</button>`).join("")}
          </div>
        </div>
        <div class="chip-row"><span class="chip-label">关键词</span>
          <input id="t-kw" class="kw" placeholder="搜姓名 / 头衔 / 简介…" value="${esc(tstate.kw)}"/>
        </div>
      </div>
      <p class="lab-count" id="tal-count"></p>
      <section class="tal-grid" id="tal-grid"></section>
    </main>`;
    $app.innerHTML = shell(body, "talents");
    document.getElementById("chips-tag").onclick = (e) => { tchipPick(e, "tag"); renderTalents(); };
    document.getElementById("chips-city").onclick = (e) => { tchipPick(e, "city"); renderTalents(); };
    document.getElementById("t-kw").oninput = (e) => { tstate.kw = e.target.value.trim(); renderTalents(); };
    renderTalents();
    window.scrollTo(0, 0);
  }

  function tchipPick(e, key) {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    tstate[key] = btn.dataset.v;
    btn.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c === btn));
  }

  function matchTalent(t) {
    if (tstate.tag && !(t.tags || []).includes(tstate.tag)) return false;
    if (tstate.city && t.city !== tstate.city) return false;
    if (tstate.kw) {
      const hay = (t.name + t.title + t.summary).toLowerCase();
      if (!hay.includes(tstate.kw.toLowerCase())) return false;
    }
    return true;
  }

  function renderTalents() {
    const list = TALENTS.filter(matchTalent);
    document.getElementById("tal-count").textContent = `共 ${list.length} 位人才`;
    document.getElementById("tal-grid").innerHTML = list.length ? list.map((t) => `
      <article class="tal-card" onclick="openTalent('${esc(t.id)}')">
        <div class="co-head">
          <div class="co-mark">${esc(t.name[0] || "·")}</div>
          <div><h2>${esc(t.name)}</h2><small>${esc(t.title)}</small></div>
        </div>
        <div class="co-tags">
          <span class="tag ind">${esc(t.city)}</span>
          ${(t.tags || []).slice(0, 3).map((g) => `<span class="tag lay">${esc(g)}</span>`).join("")}
        </div>
        <p class="co-sum">${esc((t.summary || "").slice(0, 60))}${(t.summary || "").length > 60 ? "…" : ""}</p>
        <div class="co-foot">
          <span>评分 <b>${esc(String(t.score || "-"))}</b>${t.verified ? ' · <span class="status-open">有官方证据</span>' : ""}</span>
          <span class="co-enter">查看 →</span>
        </div>
      </article>`).join("") : `<p style="grid-column:1/-1;color:var(--muted)">没有命中的人才，请放宽筛选条件。</p>`;
  }

  function openTalent(id) {
    const t = TALENTS.find((x) => x.id === id);
    if (!t) return;
    const old = document.getElementById("modal-mask");
    if (old) old.remove();
    const mask = document.createElement("div");
    mask.id = "modal-mask";
    mask.className = "modal-mask";
    const linkList = (arr) => arr.map((w) => `<li>${w.url ? `<a class="source-link" href="${esc(w.url)}" target="_blank" rel="noopener">${esc(w.title)} ↗</a>` : esc(w.title)}</li>`).join("");
    mask.innerHTML = `
      <div class="modal modal-lg" role="dialog" aria-modal="true">
        <h3>${esc(t.name)}</h3>
        <p style="margin-top:0"><b>${esc(t.title)}</b> · ${esc(t.city)} · 评分 ${esc(String(t.score || "-"))}${t.verified ? " · <span class='status-open'>有官方证据</span>" : ""}</p>
        <div class="co-tags" style="padding:0">${(t.tags || []).map((g) => `<span class="tag lay">${esc(g)}</span>`).join("")}</div>
        <div class="evd-sec"><b>简介</b><p>${esc(t.summary || "")}</p></div>
        ${t.works && t.works.length ? `<div class="evd-sec"><b>公开案例</b><ul class="fi-ol">${linkList(t.works)}</ul></div>` : ""}
        ${t.achievements && t.achievements.length ? `<div class="evd-sec"><b>获奖与成就</b><ul class="fi-ol">${linkList(t.achievements)}</ul></div>` : ""}
        <div class="evd-sec evd-src"><b>证据链</b>
          <p>${t.verified ? "已通过官方公开来源核验" : "公开来源待复核"}${t.sources && t.sources.length ? " · 来源：" + t.sources.map(esc).join("、") : ""}${t.updatedAt ? " · 数据更新：" + esc(String(t.updatedAt).slice(0, 10)) : ""}</p>
        </div>
        <button class="btn dark" id="tal-close" style="width:100%;margin-top:14px">关闭</button>
      </div>`;
    mask.onclick = (e) => { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
    document.getElementById("tal-close").onclick = () => mask.remove();
  }
  window.openTalent = openTalent; // 供人才卡内联事件使用

  /* ---------- 路由 ---------- */
  function route() {
    // 路由切换时清理残留弹窗遮罩（防跨页点击失效）
    const stray = document.getElementById("modal-mask");
    if (stray) stray.remove();
    const h = location.hash || "#/";
    const m = h.match(/^#\/co\/([\w-]+)(\/depth)?$/);
    if (m) return m[2] ? depthPage(m[1]) : companyPage(m[1]);
    if (h === "#/lab") return labPage();
    if (h === "#/dig") return digPage();
    if (h === "#/talents") return talentsPage();
    homePage();
  }
  window.addEventListener("hashchange", route);
  route();
})();
