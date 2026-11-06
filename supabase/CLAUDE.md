# supabase/ — DB 스키마

- 프로젝트 ref `druvblvdfhtxposypxyc` (ap-northeast-2). 테이블은 `scores` 하나.
- 스키마 변경은 `migrations/`에 새 SQL 파일 추가 → `npx supabase db push --remote` (`.env.local`의 `SUPABASE_DB_PASSWORD` 필요). `--remote` 없으면 로컬 Docker를 찾다 실패.
- `scores`는 RLS on + anon/authenticated 권한 회수 상태. 브라우저에서 직접 접근하게 바꾸지 말 것.
