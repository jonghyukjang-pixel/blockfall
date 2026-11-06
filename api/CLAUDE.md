# api/ — 점수 API (Vercel 함수)

- `scores.js`: `GET/POST /api/scores`. `_lib/db.js`: Supabase REST 호출 + 입력 검증(이름 1~12자, 정수 범위). 로컬 `server.js`도 공유.
- 서버 코드는 `api/` 아래에만. 루트 파일은 Vercel에서 URL로 그대로 열리므로 새 비공개 파일은 `.vercelignore`에 추가하고, 배포 후 404인지 확인.
- env: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (로컬 `.env.local`, Vercel production/preview). 비밀값은 출력·커밋 금지, 마스킹해서만 확인.
- secret key는 서버 전용. 프론트는 항상 `/api/scores`만 호출.
- `created_at`은 DB에 UTC로 저장, 응답에서 KST 문자열(`YYYY-MM-DD HH:mm:ss`)로 변환.
- 테스트 기록을 실제 DB에 남겼다면 바로 지우고 사용자에게 알린다. 기존 기록은 사용자 것이니 함부로 지우지 말 것.
- 배포: Vercel `demo-toypjt/blockfall` → https://blockfall-peach-iota.vercel.app, GitHub `jonghyukjang-pixel/blockfall`(private, push 자동 배포 미연결). 루트 `vercel.json`의 `framework: null`은 지우지 말 것.
