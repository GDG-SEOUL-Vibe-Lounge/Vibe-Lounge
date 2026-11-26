/*
 * DevFest Seoul 2026 — 쉬는 시간 프로그램 공용 런타임
 *
 * 저장 모드 2가지
 *  1) 실시간 모드: shared/firebase-config.js 에 Firebase 설정이 있으면 Firestore로
 *     모든 참가자 기기가 같은 데이터를 실시간으로 공유합니다. (QR로 접속하는 실제 행사용)
 *  2) 로컬 모드: 설정이 없거나 Firebase 연결에 실패하면 이 브라우저(localStorage)에만 저장합니다.
 *
 * 앱 코드는 어느 모드든 DFS.store.get/set/update/push/on 만 사용합니다.
 */
(function () {
  const NS = "dfs26:";
  const COLLECTION = "dfs26";
  const FB_VER = "10.14.1";

  function safeParse(raw, def) {
    if (raw == null) return def;
    try { return JSON.parse(raw); } catch (e) { return def; }
  }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

  const listeners = {};
  function emit(key, value) { (listeners[key] || []).forEach((fn) => { try { fn(value); } catch (e) { console.error(e); } }); }

  /* ---------- 공유 데이터 정규화 ----------
   * 실시간 모드의 공유 문서는 로그인 없이 누구나 쓸 수 있어요. 그래서 읽을 때마다 앱이 기대하는 모양으로
   * 강제 변환합니다: 문자열 자리에 객체나 HTML 조각, 배열 자리에 다른 값이 들어와도
   * 화면이 깨지거나 스크립트가 실행되지 않게 하려는 장치예요. (표시할 때는 추가로 DFS.esc)
   * 스키마: "s" 문자열, "n" 숫자, "b" 불리언, [스키마] 배열, {키: 스키마} 객체, {"*": 스키마} 임의 키 맵
   * 여기 없는 키는 공유 저장소에 쓰지 않아요 (firestore.rules 의 허용 목록과 같은 목록).
   */
  const schemas = {
    "roulette:ideas": [{ id: "s", name: "s", feat: "s", combo: ["s"], nick: "s", uid: "s", likes: ["s"], hidden: "b", at: "n" }],
    "museum:items": [{ id: "s", cat: "s", title: "s", story: "s", nick: "s", uid: "s", likes: ["s"], reacts: { "*": ["s"] }, reviews: [{ nick: "s", text: "s", at: "n" }], hidden: "b", at: "n" }],
    "bpx:issues": [{ id: "s", n: "n", title: "s", body: "s", label: "s", nick: "s", uid: "s", plus: ["s"], hidden: "b", resolved: "b", at: "n",
      patches: [{ id: "s", nick: "s", uid: "s", text: "s", up: ["s"], accepted: "b", at: "n" }] }],
    "mc:votes": { "*": { "*": "s" } },
    "wux:records": [{ uid: "s", nick: "s", sec: "n", at: "n" }],
    "bh:records": [{ uid: "s", nick: "s", found: "n", sec: "n", at: "n" }],
    "rhythm:records": [{ uid: "s", nick: "s", ok: "n", goods: "n", at: "n" }],
    "aih:attempts": { "*": [{ score: "n", set: "s", at: "n" }] },
    "aih:results": [{ uid: "s", nick: "s", score: "n", set: "s", at: "n" }],
    "vault:champions": [{ nick: "s", uid: "s", at: "n" }],
    "freq": { "*": { "*": { label: "s", at: "n" } } },
  };
  function shape(v, sch) {
    if (sch === "s") return typeof v === "string" ? v.slice(0, 4000) : (typeof v === "number" && isFinite(v) ? String(v) : "");
    if (sch === "n") return typeof v === "number" && isFinite(v) ? v : 0;
    if (sch === "b") return v === true;
    if (Array.isArray(sch)) {
      if (!Array.isArray(v)) return [];
      const it = sch[0]; // 모양이 다른 원소는 버린다 (예: 좋아요 목록에 섞인 객체, 항목 목록에 섞인 문자열)
      const fits = it === "s" ? (x) => typeof x === "string" : it === "n" ? (x) => typeof x === "number" && isFinite(x) : (x) => !!x && typeof x === "object" && !Array.isArray(x);
      return v.slice(0, 5000).filter(fits).map((x) => shape(x, it));
    }
    const src = v && typeof v === "object" && !Array.isArray(v) ? v : {};
    if (sch["*"]) {
      const map = Object.create(null); // 키 이름을 남이 정할 수 있는 맵: 프로토타입 없는 객체로
      Object.keys(src).slice(0, 20000).forEach((k) => { map[k] = shape(src[k], sch["*"]); });
      return map;
    }
    const out = {};
    Object.keys(sch).forEach((k) => { out[k] = shape(src[k], sch[k]); });
    return out;
  }
  /** 스키마가 있는 키는 항상 그 모양으로 돌려준다 (없는 문서 = undefined 는 그대로) */
  function norm(key, v) { const sch = schemas[key]; return sch && v !== undefined ? shape(v, sch) : v; }

  /* 기기별로만 저장하는 키: 참가자 정보, 금고 대화 기록 */
  function isLocalKey(key) { return key === "user" || key.startsWith("qr:") || key.endsWith(":seeded") || (key.startsWith("vault:") && key !== "vault:champions"); }

  /* ---------- 로컬 저장소 ---------- */
  const local = {
    get(key, def) { try { return safeParse(localStorage.getItem(NS + key), def); } catch (e) { return def; } },
    set(key, value) { try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { console.warn("local set failed", e); } },
    remove(key) { try { localStorage.removeItem(NS + key); } catch (e) { /* noop */ } },
  };

  /* ---------- Firestore 실시간 저장소 ---------- */
  const cfg = window.DFS_FIREBASE;
  const remote = { on: false, fb: null, db: null, cache: {}, loaded: {}, subs: {}, readyResolve: null };
  const ready = new Promise((res) => (remote.readyResolve = res));

  async function initRemote() {
    if (!cfg || !cfg.projectId) { remote.readyResolve("local"); return; }
    try {
      const [{ initializeApp }, fs] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-firestore.js`),
      ]);
      const app = initializeApp(cfg);
      remote.fb = fs;
      remote.db = fs.getFirestore(app);
      if (cfg.useEmulator) fs.connectFirestoreEmulator(remote.db, cfg.useEmulator[0], cfg.useEmulator[1]); // 로컬 테스트용
      remote.on = true;
      Object.keys(remote.subs).forEach((k) => subscribe(k, true));
      remote.readyResolve("firebase");
    } catch (e) {
      console.warn("Firebase 연결 실패, 로컬 모드로 동작합니다", e);
      remote.failed = true;
      remote.readyResolve("local");
      Object.keys(listeners).forEach((k) => emit(k, local.get(k, undefined)));
    }
    renderMode();
  }

  function docRef(key) { return remote.fb.doc(remote.db, COLLECTION, key); }

  function subscribe(key, force) {
    if (isLocalKey(key)) return;
    if (remote.subs[key] && !force) return;
    remote.subs[key] = true;
    if (!remote.on) return; // 연결되면 initRemote가 다시 구독
    remote.fb.onSnapshot(docRef(key), (snap) => {
      const v = snap.exists() ? safeParse(snap.data().v, undefined) : undefined;
      remote.cache[key] = v;
      remote.loaded[key] = true;
      emit(key, norm(key, v));
    }, (err) => console.warn("구독 오류", key, err));
  }

  function writeRemote(key, value) {
    return remote.fb.setDoc(docRef(key), { v: JSON.stringify(value), at: Date.now() }).catch((e) => {
      console.warn("저장 실패", key, e); toast("⚠️ 저장에 실패했어요. 네트워크를 확인해주세요");
    });
  }

  const useRemote = (key) => remote.on && !isLocalKey(key);
  /* Firebase 연결 중(첫 1~2초)에 들어온 쓰기는 연결 후 반영 */
  const pending = (key) => cfg && !remote.on && !remote.failed && !isLocalKey(key);

  const store = {
    get(key, def) {
      if (isLocalKey(key) || !cfg || remote.failed) { const lv = local.get(key, undefined); return lv === undefined ? def : norm(key, lv); }
      subscribe(key);
      const v = remote.cache[key];
      return v === undefined ? def : norm(key, clone(v));
    },
    set(key, value) {
      if (pending(key)) { ready.then(() => store.set(key, value)); emit(key, value); return value; }
      if (useRemote(key)) { remote.cache[key] = clone(value); writeRemote(key, value); }
      else local.set(key, value);
      emit(key, value);
      return value;
    },
    /* 여러 참가자가 동시에 누르는 좋아요/투표도 덮어쓰지 않도록 트랜잭션으로 반영 */
    update(key, def, fn) {
      def = clone(def); // 기본값 객체가 fn 안에서 변형되어 재사용되지 않도록
      if (pending(key)) { const v = fn(store.get(key, clone(def))); emit(key, v); ready.then(() => store.update(key, def, fn)); return v; }
      if (!useRemote(key)) { const next = fn(store.get(key, def)); return store.set(key, next); }
      const next = fn(store.get(key, clone(def)));  // 화면에 즉시 반영 (낙관적 업데이트)
      remote.cache[key] = clone(next);
      emit(key, next);
      const fs = remote.fb;
      fs.runTransaction(remote.db, async (tx) => {
        const snap = await tx.get(docRef(key));
        const cur = norm(key, snap.exists() ? safeParse(snap.data().v, clone(def)) : clone(def));
        tx.set(docRef(key), { v: JSON.stringify(fn(cur)), at: Date.now() });
      }).catch((e) => { console.warn("트랜잭션 실패", key, e); toast("⚠️ 저장에 실패했어요. 다시 시도해주세요"); });
      return next;
    },
    push(key, item) {
      return store.update(key, [], (arr) => (arr.push(clone(item)), arr));
    },
    remove(key) {
      if (useRemote(key)) { remote.cache[key] = undefined; remote.fb.deleteDoc(docRef(key)).catch(() => {}); } // 규칙상 웹 삭제는 거부됨
      else local.remove(key);
    },
    /** 값이 바뀌면 호출: 실시간 모드에서는 다른 기기, 로컬 모드에서는 같은 브라우저 다른 탭 */
    on(key, fn) {
      (listeners[key] = listeners[key] || []).push(fn);
      if (!isLocalKey(key) && cfg) subscribe(key);
    },
    /** 이 키의 첫 데이터가 도착했는지 (실시간 모드) */
    loaded(key) { return !useRemote(key) || !!remote.loaded[key]; },
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
    if (useRemote(key)) return;
    emit(key, norm(key, safeParse(e.newValue, undefined)));
  });

  function mode() { return remote.on ? "firebase" : "local"; }
  function renderMode() {
    const el = document.querySelector("[data-mode]");
    if (!el) return;
    el.textContent = remote.on ? "🟢 실시간" : "💾 이 기기만";
    el.title = remote.on ? "모든 참가자와 실시간으로 공유돼요" : "Firebase 설정 전: 이 브라우저에만 저장돼요";
  }

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
   * 닉네임만 받아요. 참가자 구분값(uid)은 기기마다 무작위로 만들어 이 브라우저에만 보관합니다.
   * (공유 데이터에는 uid 와 닉네임이 그대로 들어가므로, 티켓 번호 같은 실제 식별 정보는 받지 않아요.
   *  1인 1회 같은 제한은 기기 기준이고, 엄격한 본인 확인은 DevFest 메인 사이트의 티켓 인증 몫이에요.)
   */
  function deviceId() {
    const a = new Uint8Array(9);
    try { (window.crypto || window.msCrypto).getRandomValues(a); } catch (e) { for (let i = 0; i < a.length; i++) a[i] = Math.floor(Math.random() * 256); }
    return "D-" + Array.from(a, (x) => x.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  const user = {
    get() { return store.get("user", null); },
    set(u) { return store.set("user", u); },
    logout() { store.remove("user"); },
    require(opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        const cur = user.get();
        if (cur && cur.uid && (!opts.needNick || cur.nick)) return resolve(cur);
        const wrap = document.createElement("div");
        wrap.className = "dfs-modal";
        wrap.innerHTML = `
          <div class="card pop">
            <h3>참가자 확인</h3>
            <p class="muted small">닉네임은 전시, 랭킹에 보여요 (중복 허용). 참여 기록은 이 기기 기준으로 구분하고, 개인정보는 받지 않아요.</p>
            <label>닉네임</label>
            <input type="text" id="dfs-nick" maxlength="16" placeholder="예: 금요일배포러" value="${esc(cur ? cur.nick : "")}" />
            <div class="row" style="margin-top:14px">
              <button class="btn block" id="dfs-ok">확인</button>
            </div>
          </div>`;
        document.body.appendChild(wrap);
        const nickEl = wrap.querySelector("#dfs-nick");
        nickEl.focus();
        const submit = () => {
          const nick = nickEl.value.trim();
          if (!nick) { nickEl.classList.add("shake"); setTimeout(() => nickEl.classList.remove("shake"), 300); return; }
          const u = user.set({ uid: (cur && cur.uid) || deviceId(), nick });
          wrap.remove();
          renderWho();
          resolve(u);
        };
        wrap.querySelector("#dfs-ok").onclick = submit;
        nickEl.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.isComposing) submit(); });
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
    el.innerHTML = u ? `<b>${esc(u.nick)}</b>, 🎟️ ${Object.keys(freq.list(u.uid)).length}` : `<a href="#" data-login>참가자 확인</a>`;
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
        <span class="row" style="gap:10px"><span class="who" data-mode></span><span class="who" data-who></span></span>
      </div>`;
    renderWho();
    renderMode();
    store.on("freq", renderWho);
  }

  document.addEventListener("DOMContentLoaded", mountTopbar);
  initRemote();

  window.DFS = { store, user, freq, id, esc, toast, shuffle, pick, timeAgo, qs, renderWho, ready, mode };
})();
