/*
 * Firebase 설정 (실시간 공유 모드)
 *
 * 비워 두면(null) 각 기기 브라우저에만 저장되는 로컬 모드로 동작합니다.
 * Firebase 콘솔 → 프로젝트 설정 → 내 앱(웹) 에서 받은 firebaseConfig 값을 아래에 붙여넣으면
 * QR로 접속한 모든 참가자가 같은 데이터를 실시간으로 공유합니다.
 * 설정 방법: docs/deploy.md
 *
 * 이 값들은 공개되어도 되는 웹 클라이언트 설정입니다. 접근 제어는 firestore.rules로 합니다.
 */
window.DFS_FIREBASE = null;
/* 예시:
window.DFS_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "devfest-seoul-2026.firebaseapp.com",
  projectId: "devfest-seoul-2026",
  storageBucket: "devfest-seoul-2026.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:xxxxxxxxxxxx",
};
*/
