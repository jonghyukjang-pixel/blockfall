# CLAUDE.md

BLOCKFALL — 1인용 블록 낙하 퍼즐 게임 + 점수 랭킹. 정적 HTML 한 장 + Vercel 서버리스 함수 + Supabase(Postgres).
UI 문구와 사용자 응대는 한국어로 한다.

## 구조

| 경로 | 역할 |
|---|---|
| `blockfall.html` | 게임 전체 (HTML/CSS/JS 단일 파일, 빌드 없음). Vercel에서 `/`로 rewrite |
| `api/scores.js` | Vercel 함수 `GET/POST /api/scores` |
| `api/_lib/db.js` | Supabase REST(PostgREST) 호출 + 입력 검증. 로컬 서버와 Vercel 함수가 공유 |
| `server.js` | 로컬 개발 서버. `.env.local`을 직접 읽음. Vercel에는 배포 안 됨 (`.vercelignore`) |
| `supabase/migrations/` | DB 스키마. 변경은 새 마이그레이션 파일로만 |
| `vercel.json` | `framework: null`, install/build 없음 — 지우지 말 것 |

## 명령

```bash
npm start                                  # 로컬: http://localhost:3000 (.env.local 필요)
npx vercel --prod                          # 프로덕션 배포
npx supabase db push --remote              # 마이그레이션 적용 (SUPABASE_DB_PASSWORD 필요)
```

- Node 20+ 필요 (내장 `fetch` 사용). 런타임 npm 의존성은 없다 — `supabase`, `vercel`은 CLI용 devDependency.
- `supabase db push`는 `--remote`를 빼면 로컬 Docker 스택을 찾다가 실패한다.

## 환경 변수

`.env.local` (git·Vercel 업로드 제외)에 `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_DB_PASSWORD`.
Vercel에는 `SUPABASE_URL`, `SUPABASE_SECRET_KEY`가 production/preview로 등록돼 있다.
비밀값은 절대 출력·커밋하지 말 것. 키를 다룰 땐 스크립트로 파일에 쓰고 마스킹해서만 확인한다.

## 반드시 지킬 것

- **secret key는 서버 전용.** `scores` 테이블은 RLS on + anon/authenticated 권한 회수 상태라 브라우저에서 Supabase를 직접 부를 수 없다. 프론트는 항상 `/api/scores`만 호출.
- **Vercel 정적 노출 주의:** 프로젝트 루트 파일은 그대로 URL로 열린다. 서버 코드는 `api/` 아래(`_` 접두 폴더는 함수로 취급되지 않음)에 두고, 새 비공개 파일은 `.vercelignore`에 추가. 배포 후 민감 경로가 404인지 확인.
- 점수 검증(이름 1~12자, 정수 범위)은 `api/_lib/db.js`에서 한다. 프론트 검증만 믿지 말 것.
- `created_at`은 DB에 UTC(timestamptz)로 저장되고, API 응답에서 KST 문자열(`YYYY-MM-DD HH:mm:ss`)로 변환된다.

## 게임 코드 메모 (`blockfall.html`)

- 상태: `loading → ready → playing ⇄ paused → over`. 로딩 화면에서 Enter/클릭으로 시작.
- 줄 삭제 후 남은 블록은 칸 단위로 낙하(`applyGravity`)하고 연쇄 삭제 시 점수 × 연쇄 수.
- 게임 오버: TOP 5 표시 → 저장 성공 시 이름 입력칸·저장 버튼 숨김 → "다시 하기" 10초 카운트다운 후 로딩 화면 복귀.
- 이름 입력 중엔 게임 단축키를 무시한다(`typing()` 가드). 게임 오버 직후 0.6초 뒤 입력칸 포커스(눌려 있던 Space 유입 방지).
- 마지막 이름과 BEST 점수는 `localStorage`(`blockfall-name`, `blockfall-best`)에 저장.

## 테스트할 때

- 실제 DB(프로덕션 Supabase)에 테스트 기록을 남기지 말 것. 남겼다면 바로 삭제하고 사용자에게 알린다.
- 브라우저에서 `fetch`를 목킹해 테스트했다면 **끝나고 반드시 새로고침** — 남겨 두면 사용자의 실제 저장이 가짜 응답으로 사라진다(실제로 발생했던 문제).
- 테스트 이름을 저장하면 `localStorage.blockfall-name`에 남아 사용자의 다음 저장에 미리 채워진다. 테스트 후 지울 것.
- 사용자가 같은 브라우저 탭에서 동시에 플레이 중일 수 있다. DB의 기존 기록은 사용자 것이니 함부로 지우지 말 것.

## 배포 / 저장소

- GitHub: `jonghyukjang-pixel/blockfall` (private), 브랜치 `main`
- Vercel: `demo-toypjt/blockfall` → https://blockfall-peach-iota.vercel.app
- Supabase: 프로젝트 ref `druvblvdfhtxposypxyc` (ap-northeast-2)
- GitHub push 자동 배포는 Vercel GitHub 앱이 저장소에 설치돼야 동작한다. 연결 전까지는 `npx vercel --prod`로 배포.
