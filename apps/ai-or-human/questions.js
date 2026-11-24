/*
 * AI일까 사람일까 — 문항 데이터
 *
 * - set: 문항 세트 이름. 스레드 논의대로 "여러 세트"를 두고 ?set=이름 으로 고를 수 있습니다.
 * - answer: "ai" | "human"
 * - human 문항은 출처가 확실한 것만 넣었습니다(공공 영역 문학, 공개 소스코드 주석, 널리 알려진 짧은 발언).
 * - ai 문항은 이 샘플을 만든 AI가 직접 작성한 문장입니다.
 * - 실제 행사용 문항(광고문구, 소설 발췌 등)은 운영진이 구글 드라이브에 정리 중인 세트로 교체하세요.
 *   이미지 문항은 저작권 확인 후 image 필드(경로)를 추가하면 같은 화면에서 표시됩니다.
 */
window.AIH_QUESTIONS = [
  // ---------- 쉬움 ----------
  { set: "sample", level: "쉬움", type: "카페 리뷰", answer: "ai",
    text: "단순한 카페를 넘어, 쉼과 영감이 공존하는 공간이었습니다. 따뜻한 조명, 향긋한 커피, 그리고 여유. 일상에 작은 쉼표가 필요할 때 꼭 다시 찾고 싶은 곳입니다.",
    why: "'단순한 OO을 넘어', 'A, B, 그리고 C' 같은 3단 나열은 AI가 자주 쓰는 말버릇이에요." },
  { set: "sample", level: "쉬움", type: "시", answer: "human",
    text: "나 보기가 역겨워\n가실 때에는\n말없이 고이 보내 드리우리다",
    why: "김소월 「진달래꽃」(1925)의 첫 연이에요.", source: "김소월, 「진달래꽃」, 1925 (공공 영역)" },
  { set: "sample", level: "쉬움", type: "커밋 메시지", answer: "ai",
    text: "feat: Enhance overall user experience by implementing comprehensive and robust error handling mechanisms across all modules",
    why: "'comprehensive', 'robust', 'enhance overall' — 무엇을 고쳤는지는 없고 형용사만 가득한 커밋은 AI 냄새가 나요." },
  { set: "sample", level: "쉬움", type: "커밋 메시지", answer: "human",
    text: "Initial revision of \"git\", the information manager from hell",
    why: "리누스 토르발스가 2005년에 남긴 Git 저장소의 첫 커밋 메시지예요.", source: "git/git 저장소 최초 커밋 (2005-04-07)" },
  { set: "sample", level: "쉬움", type: "붕어빵 광고", answer: "ai",
    text: "겉은 바삭, 속은 촉촉. 한 입 베어 무는 순간, 당신의 겨울이 따뜻하게 채워집니다. 지금, 가장 달콤한 위로를 만나보세요.",
    why: "'~하는 순간', '당신의 OO이 채워집니다', '지금, ~을 만나보세요'까지 정석 템플릿을 그대로 따라가요." },
  { set: "sample", level: "쉬움", type: "소설 첫 문장", answer: "human",
    text: "새침하게 흐린 품이 눈이 올 듯하더니 눈은 아니 오고 얼다가 만 비가 추적추적 내리는 날이었다.",
    why: "현진건 「운수 좋은 날」(1924)의 첫 문장이에요. '새침하게 흐린 품' 같은 표현은 AI가 잘 만들지 않죠.", source: "현진건, 「운수 좋은 날」, 1924 (공공 영역)" },
  { set: "sample", level: "쉬움", type: "행사 후기", answer: "ai",
    text: "이번 컨퍼런스는 기술적 인사이트와 네트워킹 기회를 동시에 제공한 뜻깊은 시간이었습니다. 앞으로도 이러한 소중한 경험을 바탕으로 끊임없이 성장하는 개발자가 되겠습니다.",
    why: "구체적인 세션 이름이나 에피소드 없이 '뜻깊은', '소중한', '끊임없이 성장'만 남은 후기는 AI가 쓴 경우가 많아요." },

  // ---------- 보통 ----------
  { set: "sample", level: "보통", type: "코드 주석", answer: "human",
    text: "# TEMPORARY, I HOPE HOPE HOPE",
    why: "아폴로 11호 달 착륙선 유도 컴퓨터(AGC) 소스코드에 실제로 남아 있는 주석이에요. 1969년에도 개발자는 'TODO'에 불안해했어요.", source: "Apollo 11 Luminary099 소스코드 (미국 정부 저작물, 공공 영역)" },
  { set: "sample", level: "보통", type: "코드 주석", answer: "ai",
    text: "// This function efficiently handles the edge case where the input array is empty, ensuring robust and predictable behavior.",
    why: "함수 이름만 읽어도 알 수 있는 내용을 'efficiently', 'robust', 'ensuring'으로 포장했어요. 사람은 보통 이렇게 정성껏 쓰지 않죠." },
  { set: "sample", level: "보통", type: "메일링 리스트 글", answer: "human",
    text: "I'm doing a (free) operating system (just a hobby, won't be big and professional like gnu)",
    why: "1991년 리누스 토르발스가 리눅스를 처음 알린 글이에요. 겸손한 괄호 두 개가 사람답죠.", source: "comp.os.minix 게시글, 1991-08-25" },
  { set: "sample", level: "보통", type: "연말 인사", answer: "ai",
    text: "올 한 해 함께해주셔서 진심으로 감사드립니다. 다가오는 새해에는 더 큰 행복과 건강, 그리고 무한한 가능성이 여러분과 함께하기를 바랍니다.",
    why: "누구에게 보내도 되는 문장, '그리고'로 묶은 3단 나열 — AI 연말 인사의 전형이에요." },
  { set: "sample", level: "보통", type: "시", answer: "human",
    text: "지금은 남의 땅—빼앗긴 들에도 봄은 오는가?",
    why: "이상화 「빼앗긴 들에도 봄은 오는가」(1926)의 첫 행이에요.", source: "이상화, 「빼앗긴 들에도 봄은 오는가」, 1926 (공공 영역)" },
  { set: "sample", level: "보통", type: "에러 메시지", answer: "ai",
    text: "앗, 무언가 잘못되었어요! 😢 걱정하지 마세요. 저희 팀이 이미 이 문제를 인지하고 있으며, 최대한 빠르게 해결하기 위해 최선을 다하고 있습니다.",
    why: "실제로는 아무도 모르는 상황에서 '이미 인지하고 있다'고 안심시키는 문장, AI가 생성한 템플릿에서 자주 보여요." },
  { set: "sample", level: "보통", type: "속담", answer: "human",
    text: "가는 날이 장날",
    why: "오래된 우리 속담이에요. 짧고 맥락 의존적인 표현은 사람의 언어 습관에 가까워요.", source: "한국 속담" },

  // ---------- 어려움 ----------
  { set: "sample", level: "어려움", type: "회고록", answer: "ai",
    text: "솔직히 말하면 이번 스프린트는 망했다. 금요일 밤 11시에 롤백 버튼을 누르면서 생각했다. 다음엔 테스트 코드를 먼저 쓰자고. 물론 다음에도 안 쓸 거라는 걸 나는 안다.",
    why: "구어체와 자조적인 마무리까지 흉내 낸 AI 문장이에요. 요즘 AI는 '사람 같은 척'도 꽤 잘해요." },
  { set: "sample", level: "어려움", type: "커밋 메시지", answer: "ai",
    text: "fix typo (진짜 마지막)",
    why: "AI에게 '귀찮은 개발자처럼 커밋 메시지를 써줘'라고 해서 나온 결과예요. 짧다고 다 사람은 아니에요!" },
  { set: "sample", level: "어려움", type: "동시", answer: "ai",
    text: "서버도 크리스마스엔\n조용히 쉬고 싶대\n하지만 오늘도\n알림은 울리지",
    why: "AI가 '개발자 크리스마스 동시'라는 주제로 쓴 문장이에요." },
  { set: "sample", level: "어려움", type: "광고 카피", answer: "ai",
    text: "말 안 해도 알아요. 당신이 오늘 얼마나 버텼는지.",
    why: "짧고 감성적인 카피도 AI가 금방 만들어요. 출처가 없는 '좋은 문장'은 일단 의심해보세요." },
  { set: "sample", level: "어려움", type: "소설 문장", answer: "human",
    text: "괴상하게도 오늘은 운수가 좋더니만…",
    why: "현진건 「운수 좋은 날」(1924) 속 김첨지의 대사예요. 제목과 이어지는 복선이죠.", source: "현진건, 「운수 좋은 날」, 1924 (공공 영역)" },
  { set: "sample", level: "어려움", type: "README", answer: "ai",
    text: "🚀 Blazing fast, lightweight, and fully customizable. Built with ❤️ for developers who care about performance.",
    why: "로켓 이모지, 'Blazing fast', 'Built with ❤️'까지 AI가 생성한 README의 단골 조합이에요." },
];

window.AIH_BONUS = {
  text: "지금 풀고 있는 이 퀴즈 앱은 누가 만들었을까요?",
  answer: "ai",
  why: "이 샘플 앱의 코드와 AI 문항은 AI가 만들었어요. 사람 문항은 출처가 확실한 공개 작품에서 골랐고요.",
};
