# BLOCKFALL

1인용 블록 낙하 퍼즐 게임 + 점수 랭킹 (Vercel + Supabase)

## 구성

| 경로 | 설명 |
|---|---|
| `blockfall.html` | 게임 (Vercel에서 `/`로 제공) |
| `api/scores.js` | Vercel 서버리스 함수 — 점수 API |
| `lib/db.js` | Supabase REST 연동 (서버 전용 secret key 사용) |
| `supabase/migrations/` | `scores` 테이블 스키마 |
| `server.js` | 로컬 개발 서버 (`.env.local`의 Supabase 키 사용) |

## 환경 변수

| 이름 | 설명 |
|---|---|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase secret(service_role) 키 — 서버에서만 사용 |

Vercel에는 `vercel env add`로, 로컬에는 `.env.local`에 넣습니다 (`.env*`는 git/배포에서 제외).

## 로컬 실행

```bash
npm install
npm start
```

http://localhost:3000

## 배포

GitHub `main` 브랜치에 push하면 Vercel이 자동 배포합니다. 수동 배포: `npx vercel --prod`

DB 스키마 변경: `supabase/migrations/`에 SQL 추가 후 `npx supabase db push`

## API

- `GET /api/scores?limit=10` — 점수 높은 순 상위 기록 (limit 1~100)
- `POST /api/scores` — `{ "name": "홍길동", "score": 1200, "lines": 8, "level": 1 }` → `201 { "ok": true, "rank": 3 }`
