/*
 * DevFest Seoul 2026 — 쉬는 시간 프로그램 공용 런타임
 *
 * 샘플 단계에서는 모든 데이터를 브라우저 localStorage에 저장합니다.
 * 실제 행사에서는 DFS.store 구현만 Firebase(Firestore) 등으로 바꾸면
 * 각 앱 코드는 그대로 쓸 수 있도록 get/set/update/on 인터페이스로 감쌌습니다.
 */
(function () {
  const NS = "dfs26:";

  function safeParse(raw, def) {
    if (raw == null) return def;
    try { return JSON.parse(raw); } catch (e) { return def; }
  }

  const listeners = {};

  const store = {
    get(key, def) {
      try { return safeParse(localStorage.getItem(NS + key), def); } catch (e) { return def; }
    },
    set(key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { console.warn("store.set failed", e); }
      (listeners[key] || []).forEach((fn) => fn(value));
      return value;
    },
    update(key, def, fn) {
      const next = fn(store.get(key, def));
      return store.set(key, next);
    },
    push(key, item) {
      return store.update(key, [], (arr) => (arr.push(item), arr));
    },
    remove(key) {
      try { localStorage.removeItem(NS + key); } catch (e) { /* noop */ }
    },
    /** 같은 브라우저의 다른 탭(예: 모니터 화면)에서 값이 바뀌면 호출 */
    on(key, fn) {
      (listeners[key] = listeners[key] || []).push(fn);
    },
    keys() {
      const out = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(NS)) out.push(k.slice(NS.length));
        }
      } catch (e) { /* noop */ }
      return out;
    },
  };

  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(NS)) return;
    const key = e.key.slice(NS.length);
    (listeners[key] || []).forEach((fn) => fn(safeParse(e.newValue, null)));
  });

  function id(prefix) {
    return (prefix || "") + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function toast(msg, ms) {
    let el = document.getElementById("dfs-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "dfs-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), ms || 2200);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "방금";
    if (s < 3600) return Math.floor(s / 60) + "분 전";
    if (s < 86400) return Math.floor(s / 3600) + "시간 전";
    return Math.floor(s / 86400) + "일 전";
  }

  function qs(name) { return new URLSearchParams(location.search).get(name); }

  /* ---------------- 참가자 식별 ----------------
   * 스레드 논의: "티켓 구매 계정 UID로 중복 방지(확인 중)".
   * 샘플에서는 티켓 번호(또는 현장 발급 1회용 코드)를 입력받고,
   * 닉네임은 중복 허용으로 따로 받습니다.
   */
  const user = {
    get() { return store.get("user", null); },
    set(u) { return store.set("user", u); },
    logout() { store.remove("user"); },
    require(opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        const cur = user.get();
        if (cur && (!opts.needNick || cur.nick)) return resolve(cur);
        const wrap = document.createElement("div");
        wrap.className = "dfs-modal";
        wrap.innerHTML = `
          <div class="card pop">
            <h3>참가자 확인</h3>
            <p class="muted small">공식 기록, 프리퀀시 적립, 중복 참여 방지에 사용돼요.
            샘플에서는 아무 값이나 넣어도 됩니다.</p>
            <label>티켓 번호 / 현장 참여 코드</label>
            <input type="text" id="dfs-uid" placeholder="예: DFS26-0001" value="${esc(cur ? cur.uid : "")}" />
            <label>닉네임 (전시/랭킹에 표시, 중복 허용)</label>
            <input type="text" id="dfs-nick" maxlength="16" placeholder="예: 금요일배포러" value="${esc(cur ? cur.nick : "")}" />
            <div class="row" style="margin-top:14px">
              <button class="btn block" id="dfs-ok">확인</button>
            </div>
          </div>`;
        document.body.appendChild(wrap);
        const uidEl = wrap.querySelector("#dfs-uid");
        const nickEl = wrap.querySelector("#dfs-nick");
        uidEl.focus();
        wrap.querySelector("#dfs-ok").onclick = () => {
          const uid = uidEl.value.trim().toUpperCase();
          const nick = nickEl.value.trim();
          if (!uid) { uidEl.classList.add("shake"); setTimeout(() => uidEl.classList.remove("shake"), 300); return; }
          if (!nick) { nickEl.classList.add("shake"); setTimeout(() => nickEl.classList.remove("shake"), 300); return; }
          const u = user.set({ uid, nick });
          wrap.remove();
          renderWho();
          resolve(u);
        };
      });
    },
  };

  /* ---------------- 프리퀀시(스탬프) ----------------
   * 프로그램별로 참가자당 1개만 적립 (예: 버그 박물관 사연 여러 개 제출해도 1개).
   */
  const freq = {
    all() { return store.get("freq", {}); },
    has(uid, source) { const f = freq.all(); return !!(f[uid] && f[uid][source]); },
    award(uid, source, label) {
      if (!uid) return false;
      let awarded = false;
      store.update("freq", {}, (f) => {
        f[uid] = f[uid] || {};
        if (!f[uid][source]) { f[uid][source] = { label: label || source, at: Date.now() }; awarded = true; }
        return f;
      });
      if (awarded) toast("🎟️ 프리퀀시 1개 적립! (" + (label || source) + ")", 2600);
      return awarded;
    },
    list(uid) { const f = freq.all(); return f[uid] || {}; },
  };

  function renderWho() {
    const el = document.querySelector("[data-who]");
    if (!el) return;
    const u = user.get();
    el.innerHTML = u ? `<b>${esc(u.nick)}</b>, ${esc(u.uid)}, 🎟️ ${Object.keys(freq.list(u.uid)).length}` : `<a href="#" data-login>참가자 확인</a>`;
    const a = el.querySelector("[data-login]");
    if (a) a.onclick = (e) => { e.preventDefault(); user.require({ needNick: true }); };
  }

  /** 상단 바 삽입: <div data-topbar data-title="..."></div> */
  function mountTopbar() {
    const host = document.querySelector("[data-topbar]");
    if (!host) return;
    const depth = host.hasAttribute("data-depth") ? host.getAttribute("data-depth") : "../../";
    host.outerHTML = `
      <div class="topbar">
        <a class="home" href="${depth}index.html"><span class="brand-dots"><i></i><i></i><i></i><i></i></span>DevFest Seoul 2026</a>
        <span class="who" data-who></span>
      </div>`;
    renderWho();
  }

  document.addEventListener("DOMContentLoaded", mountTopbar);

  window.DFS = { store, user, freq, id, esc, toast, shuffle, pick, timeAgo, qs, renderWho };
})();
