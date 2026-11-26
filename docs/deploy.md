# 배포 가이드: QR로 바로 쓰는 실시간 버전 만들기

전체 흐름은 3단계예요. 1, 2단계를 끝내면 참가자가 QR을 스캔하자마자 모든 기능이 휴대폰에서 동작하고,
좋아요, 투표, 전시, 랭킹이 모든 참가자에게 실시간으로 공유됩니다.

| 단계 | 하는 일 | 소요 | 결과 |
|---|---|---|---|
| 1 | GitHub Pages 켜기 | 1분 | `https://gdg-seoul-vibe-lounge.github.io/Vibe-Lounge/` 주소 생성 |
| 2 | Firebase(Firestore) 연결 | 10분 | 모든 기기가 같은 데이터를 실시간 공유 (`🟢 실시간` 표시) |
| 3 | QR 안내판 인쇄 | 5분 | `qr.html`에서 A4 4장 배치로 인쇄 / PDF 저장 |

> 2단계 전에는 **로컬 모드**(`💾 이 기기만`)로 동작해요. 혼자 체험은 되지만, 참가자끼리 데이터가 보이지 않아요.

---

## 1. GitHub Pages 켜기 (조직 관리자)

1. https://github.com/GDG-SEOUL-Vibe-Lounge/Vibe-Lounge/settings/pages 접속
2. **Build and deployment → Source: Deploy from a branch**
3. **Branch: `main` / `/ (root)`** 선택 → Save
4. 1~2분 뒤 `https://gdg-seoul-vibe-lounge.github.io/Vibe-Lounge/` 접속 확인

---

## 2. Firebase 연결 (실시간 공유)

### 2-1. 프로젝트와 Firestore 만들기
1. https://console.firebase.google.com → **프로젝트 추가** (예: `devfest-seoul-2026`), Google 애널리틱스는 꺼도 됨
2. 왼쪽 **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3 (서울)`
   - **프로덕션 모드**로 시작
3. **규칙** 탭에 저장소의 [`firestore.rules`](../firestore.rules) 내용을 붙여넣고 **게시**

### 2-2. 웹 앱 설정값 받기
1. 프로젝트 개요 옆 ⚙️ **프로젝트 설정 → 일반 → 내 앱 → 웹(`</>`)** 추가 (호스팅 체크 불필요)
2. 표시되는 `firebaseConfig` 값을 복사
3. 저장소의 [`shared/firebase-config.js`](../shared/firebase-config.js)에서 `window.DFS_FIREBASE = null;` 을 아래처럼 바꿔 커밋

```js
window.DFS_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "devfest-seoul-2026.firebaseapp.com",
  projectId: "devfest-seoul-2026",
  storageBucket: "devfest-seoul-2026.appspot.com",
  messagingSenderId: "...",
  appId: "...",
};
```

> 이 값은 브라우저에 그대로 노출되는 공개용 설정이라 커밋해도 괜찮아요. 접근 제어는 `firestore.rules`가 담당합니다.

### 2-3. 확인
- 아무 프로그램 페이지를 열어 오른쪽 위에 **🟢 실시간**이 보이면 성공
- 휴대폰 2대로 같은 페이지를 열고, 한쪽에서 버그 사연을 올리면 다른 쪽에 바로 나타나는지 확인
- Firestore 콘솔의 `dfs26` 컬렉션에 문서(`museum:items`, `roulette:ideas` 등)가 생깁니다

### 데이터 구조
- 컬렉션 `dfs26`, 문서 ID = 데이터 키, 필드 `v` = JSON 문자열, `at` = 저장 시각
- 좋아요/투표처럼 여러 명이 동시에 누르는 값은 트랜잭션으로 반영해 서로 덮어쓰지 않아요
- 참가자 정보(`user`)와 AI 금고 대화 기록은 각 기기에만 저장돼요
- 공유 문서 키는 `firestore.rules`의 허용 목록(= `shared/core.js`의 `schemas`)에 있는 것만 쓸 수 있어요

### 보안 메모 (실시간 모드를 켜기 전에 읽어주세요)

실시간 모드는 **로그인 없이 누구나 읽고 쓰는** 단순한 구조예요. 행사용 놀이 프로그램 수준을 전제로 한 선택이고, 한계는 아래와 같아요.

| 막는 것 | 못 막는 것 |
|---|---|
| 허용 목록 밖 문서 생성, 문서 삭제, 형식 밖 필드 (`firestore.rules`) | 마음먹은 참가자가 개발자 도구로 공유 데이터를 덮어쓰거나 비우는 것 (사연 지우기, 좋아요, 투표, 랭킹 조작) |
| 저장된 값에 섞인 HTML, 스크립트 실행 (읽을 때 스키마 정규화 + 표시할 때 이스케이프) | `?admin=1` 숨김 기능을 주소를 아는 참가자가 쓰는 것 |
| 개인정보 노출 (닉네임과 기기별 무작위 ID만 저장) | 닉네임 사칭, 기기를 바꿔 가며 중복 참여 |

- 경품이 걸린 순위(올해의 버그, 타임어택 랭킹)는 **최종 확인을 사람이** 해주세요.
- 행사 중간중간 Firestore 콘솔에서 `dfs26` 문서 내용을 복사해 두면 훼손돼도 되돌릴 수 있어요.
- 더 강한 보호(익명 인증, 항목별 문서, 작성자만 수정)가 필요하면 저장 구조를 바꿔야 해요.

### 행사 전 리허설 / 행사 후 정리
- 리허설 데이터 삭제: Firestore 콘솔에서 `dfs26` 컬렉션의 문서 삭제 (규칙상 웹에서는 삭제 불가)
- 무료(Spark) 요금제 한도: 하루 읽기 5만, 쓰기 2만 회. 수백 명 규모 행사는 보통 충분하지만, 모니터 화면을 여러 대 오래 켜두면 읽기가 늘어나요

---

## 3. QR 안내판 만들기

1. 배포된 사이트의 **`qr.html`** 접속 (운영진용 페이지 `ops.html` → QR 안내판 만들기)
2. 배포 주소가 자동으로 들어가요 (다른 주소에 배포했다면 직접 입력 후 적용)
3. **🖨️ 인쇄 / PDF 저장** → A4 한 장에 안내판 4개
4. 개별 QR 이미지가 필요하면 각 안내판 오른쪽 위 **PNG** 버튼

공간별로 붙일 QR

| 공간 | QR |
|---|---|
| 바이브라운지 | BUILD ROULETTE |
| 복도 | AI일까 사람일까, 2026 Bug Museum |
| 입구, 안내 데스크 | 쉬는 시간 프로그램 전체 (허브) |

모니터가 있으면 아래 주소를 전체화면(F11)으로 띄워두세요.
- `.../apps/build-roulette/index.html?screen=1` 룰렛 아이디어 랜덤 전시
- `.../apps/bug-museum/index.html?screen=1` 박물관 전시 + 올해의 버그 TOP 5
- `.../apps/merge-conflict/index.html?screen=1` 실시간 투표 결과

---

## 4. 노션(Notion)에서 바로 띄우기

배포된 주소는 노션 페이지 안에서도 그대로 실행돼요. 운영팀 노션이나 참가자 안내 페이지에 넣을 때:

1. 노션 페이지에서 `/embed` 입력 → **임베드** 선택
2. 프로그램 주소 붙여넣기 (예: `https://gdg-seoul-vibe-lounge.github.io/Vibe-Lounge/apps/bug-museum/index.html`)
3. 블록 크기를 세로로 길게 조절

> 노션 임베드 안에서도 실시간 데이터가 공유돼요. 다만 노션 앱 안의 임베드는 브라우저 저장소가 따로라서 참가자 확인을 한 번 더 할 수 있어요.

---

## (선택) GitHub Pages 대신 Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase use --add            # 2단계에서 만든 프로젝트 선택
firebase deploy --only hosting,firestore:rules
```
`https://<프로젝트ID>.web.app` 주소가 생기고, `qr.html`에서 그 주소로 QR을 만들면 돼요.

## (개발용) 로컬에서 실시간 모드 테스트

```bash
npx firebase-tools emulators:start --only firestore --project demo-dfs26
# shared/firebase-config.js 임시 설정
# window.DFS_FIREBASE = { apiKey: "x", projectId: "demo-dfs26", appId: "1:1:web:1", useEmulator: ["127.0.0.1", 8089] };
python3 -m http.server 8000
```
