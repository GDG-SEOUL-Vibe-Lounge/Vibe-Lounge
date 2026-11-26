# Vibe-Lounge
아이디어 MVP(프로토타입)

- 브랜치별 아이디어 구현 (`idea/*` 브랜치), `main`은 전체 통합본

## DevFest Seoul 2026, 쉬는 시간 프로그램 샘플

GDG Seoul DevFest Seoul 2026 운영팀 스레드(#devfestseoul-2026, 프로그램 및 운영 준비)에서 나온 아이디어를
바로 체험할 수 있는 웹 샘플로 만든 저장소입니다.

- **DevFest 메인 사이트 연동: [`docs/main-site-integration.md`](docs/main-site-integration.md)** (테마, 내비게이션, 스탬프 흐름, 메인 사이트에 넣을 섹션)
- **QR로 바로 쓰는 실시간 버전 배포: [`docs/deploy.md`](docs/deploy.md)** (GitHub Pages + Firebase, QR 안내판 `qr.html`)
- 스레드 요약: [`docs/thread-summary.md`](docs/thread-summary.md)
- 운영 가이드 / 실제 행사 전환 방법: [`docs/operations.md`](docs/operations.md)

### ✅ 최종 확정 프로그램 (11/12)

| 공간 | 프로그램 | 경로 |
|---|---|---|
| 바이브라운지 | 🎰 BUILD ROULETTE, 세상에 없던 서비스 만들기 | [`apps/build-roulette`](apps/build-roulette) |
| 복도 | 🤖 AI일까 사람일까 | [`apps/ai-or-human`](apps/ai-or-human) |
| 복도 | 🏛️ 2026 Bug Museum, 올해의 버그 박물관 | [`apps/bug-museum`](apps/bug-museum) |

### 🧪 후보 아이디어 샘플

| 프로그램 | 경로 |
|---|---|
| 🔐 AI 금고 털기 | [`apps/ai-vault`](apps/ai-vault) |
| 🛠️ Bug & Patch Exchange | [`apps/bug-patch-exchange`](apps/bug-patch-exchange) |
| ⚔️ MERGE CONFLICT | [`apps/merge-conflict`](apps/merge-conflict) |
| ⏰ WORST UX EVER | [`apps/worst-ux`](apps/worst-ux) |
| 🐛 BUG HUNTERS | [`apps/bug-hunters`](apps/bug-hunters) |
| 🥁 크리스마스 리듬 챌린지 | [`apps/rhythm-challenge`](apps/rhythm-challenge) |
| 🧰 현장 도우미 (릴레이 그림, 컬러 헌트, 3-Prompt/릴레이 바이브코딩 타이머) | [`apps/field-kit`](apps/field-kit) |

### 실행

빌드 과정이 없는 정적 사이트입니다.

```bash
python3 -m http.server 8000
# http://localhost:8000 접속
```

GitHub Pages: Settings → Pages → Branch `main` / root 로 켜면 QR 코드로 바로 배포할 수 있어요.

### 공통 기능

- 화면 테마와 상단 바는 DevFest 메인 사이트(devfest-seoul-2026.vercel.app)와 같게 맞춤
- 참가자 확인은 닉네임만 입력 (구분값은 기기별 무작위 ID, 개인정보 미수집)
- 프로그램을 끝내면 완료 인증 화면이 뜨고, 스태프에게 보여 준 뒤 메인 사이트 스탬프판에 도장을 받는 흐름 (프로그램당 1번)
- `index.html`은 참가자용 목록 (확정 프로그램만), **`ops.html`은 운영진용 페이지** (모니터 화면, 검수, QR 안내판, 후보 프로그램 샘플). 참가자용 목록 맨 아래 문구를 빠르게 5번 누르면 운영진용 페이지로 이동
- `?screen=1` 모니터 화면 (룰렛, 박물관, 투표), `?admin=1` 운영진 숨김 처리 (룰렛, 박물관, 고민 게시판): 링크는 `ops.html`에 모아 둠
- 저장 모드: `shared/firebase-config.js` 설정 시 **실시간 공유(Firestore)**, 미설정 시 이 브라우저에만 저장 (오른쪽 위 `🟢 실시간` / `💾 이 기기만` 표시)
- `qr.html`: 배포 주소 기준 QR 안내판 생성, A4 인쇄 / PNG 다운로드

### 저작권 메모

- AI일까 사람일까의 '사람' 샘플 문항은 공공 영역 문학(1924~1926년 작품), 미국 정부 공개 소스코드 주석, 널리 알려진 짧은 발언만 사용했습니다.
- 실제 문항(광고 문구, 소설 발췌, 이미지 등)은 저작권 확인 후 `questions.js`에 추가하세요.

### 🌿 브랜치 구성

| 브랜치 | 내용 |
|---|---|
| `main` | 전체 통합본 (허브 페이지 + 모든 프로그램 + 문서) |
| `idea/build-roulette` | 🎰 BUILD ROULETTE (확정, 바이브라운지) |
| `idea/ai-or-human` | 🤖 AI일까 사람일까 (확정, 복도) |
| `idea/bug-museum` | 🏛️ 2026 Bug Museum (확정, 복도) |
| `idea/ai-vault` | 🔐 AI 금고 털기 |
| `idea/bug-patch-exchange` | 🛠️ Bug & Patch Exchange |
| `idea/merge-conflict` | ⚔️ MERGE CONFLICT |
| `idea/worst-ux` | ⏰ WORST UX EVER |
| `idea/bug-hunters` | 🐛 BUG HUNTERS |
| `idea/rhythm-challenge` | 🥁 크리스마스 리듬 챌린지 |
| `idea/field-kit` | 🧰 현장 도우미 (릴레이 그림, 컬러 헌트, 3-Prompt/릴레이 바이브코딩) |

각 `idea/*` 브랜치에는 공용 런타임(`shared/`)과 해당 프로그램만 들어 있어서, 아이디어별로 따로 고도화한 뒤 `main`에 PR로 합치면 됩니다.
