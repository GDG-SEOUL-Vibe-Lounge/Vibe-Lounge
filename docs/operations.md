# 운영 가이드 & 다음 단계

## 샘플 구조

- 빌드 없이 동작하는 정적 HTML (GitHub Pages에 그대로 배포 가능)
- `shared/core.js`
  - `DFS.store` : 데이터 저장 (Firebase 설정 시 Firestore 실시간 공유, 아니면 이 브라우저의 localStorage)
  - `DFS.user` : 참가자 확인 (닉네임만 입력, 구분값은 기기별 무작위 ID)
  - `DFS.freq` : 프로그램 완료 기록 (프로그램당 1인 1번) + 도장 받기 안내 화면
  - `DFS.main` : DevFest 메인 사이트 주소, 같은 도메인 여부 ([main-site-integration.md](main-site-integration.md))
- 각 앱은 `?screen=1`(모니터 화면), `?admin=1`(운영진 숨김 처리)을 지원. 링크는 운영진용 페이지 `ops.html`에 모아 두었고 참가자 화면에는 노출하지 않음
- `index.html`은 참가자용 목록(확정 프로그램만), `ops.html`은 운영진용(후보 프로그램 샘플 포함). 참가자 화면에는 링크가 없고, 목록 맨 아래 문구를 빠르게 5번 누르면 이동

## 실제 행사용으로 바꿀 것

| 항목 | 샘플 | 실제 행사 제안 |
|---|---|---|
| 데이터 공유 | ✅ 구현 완료: `shared/firebase-config.js` 설정만 하면 Firestore 실시간 공유 ([deploy.md](deploy.md)) | |
| 참가자 식별 | 닉네임 + 기기별 무작위 ID (개인정보 미수집, 제한은 기기 단위) | 엄격한 1인 제한이 필요하면 DevFest 메인 사이트의 티켓 인증과 연동 |
| 운영진 권한 | `?admin=1` 쿼리 | Firebase Auth + Security Rules로 운영진만 숨김 가능 |
| 도장(스탬프) | 완료 인증 화면 + 내 QR 열기 버튼 | 스태프가 메인 사이트에서 참가자 QR을 스캔해 도장. 자동 지급은 메인 서버 API가 있어야 가능 ([main-site-integration.md](main-site-integration.md)) |
| AI 금고 털기 | 규칙 기반 시뮬레이터 | Gemini API(서버리스 함수 경유) + 출력 필터, 시스템 프롬프트는 앱 내 '운영 메모' 참고 |

## 프로그램별 운영 체크리스트

### BUILD ROULETTE (바이브라운지)
- 룰렛 문구(대상/문제/제약)는 `apps/build-roulette/index.html`의 `REELS`에서 수정
- 제출 아이디어 공개 전 콘텐츠 관리: `?admin=1`에서 숨김
- 'AI Studio 프롬프트 복사'로 바이브코딩 시작점 제공 → 3-Prompt 챌린지와 연계 가능

### AI일까 사람일까 (복도)
- 문항은 `apps/ai-or-human/questions.js`, 세트는 `set` 필드 + `?set=이름`
- `CONFIG.passScore`(통과 기준), `CONFIG.maxAttempts`(최초 1 + 재도전 2) 조정
- 사람 문항은 출처가 확실하고 저작권 문제가 없는 것만 사용 (샘플은 공공 영역 문학, 공개 소스코드 주석)

### 2026 Bug Museum (복도)
- 예시 사연 3개는 로컬 모드에서만 들어가는 시드 데이터 (실시간 모드에서는 넣지 않음)
- 사연 1인 2개, 즉시 공개, 닉네임, 좋아요 순위, 관람평/공감 리액션 구현
- 개인정보, 사내 정보 금지 안내 문구 포함
