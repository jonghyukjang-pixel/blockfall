---
paths:
  - "blockfall.html"
---

# blockfall.html — 게임 (단일 파일, 빌드 없음, UI 문구는 한국어)

- 상태: `loading → ready → playing ⇄ paused → over`. 로딩 화면에서 Enter/클릭으로 시작.
- 줄 삭제 후 남은 블록은 칸 단위 낙하(`applyGravity`), 연쇄 삭제 시 점수 × 연쇄 수.
- 게임 오버: TOP 5 → 저장 성공 시 입력칸·저장 버튼 숨김 → "다시 하기" 10초 후 로딩 화면 복귀.
- 이름 입력 중 단축키 무시(`typing()`), 게임 오버 0.6초 뒤 입력칸 포커스. `localStorage`: `blockfall-name`, `blockfall-best`.
- 테스트 시 `fetch` 목킹 후 반드시 새로고침, 테스트 이름은 `localStorage`에서 지울 것.
