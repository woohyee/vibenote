# HANDOFF — Vibe Note v2

## 마지막 세션
- **날짜**: 2026-04-14
- **브랜치**: main
- **배포 URL**: https://vibe-note.vercel.app
- **GitHub**: https://github.com/woohyee/vibenote

## 현재 상태: MVP 배포 완료 ✅

Vibe Note v2가 Vercel에 배포되어 실제 사용 가능한 상태.
Google 로그인 → 프로젝트 관리 → 기록(피드백/아이디어/할일/로그) 입력/조회 동작 확인.

## 기술 스택
- Next.js 16 + TypeScript + Tailwind CSS
- Firebase (Auth + Firestore)
- @serwist/next (PWA, 아직 미설정)
- Vercel 배포

## 완료된 작업
1. /office-hours → 디자인 문서 작성 + 승인
2. /plan-eng-review → 아키텍처 리뷰 완료 (CLEARED)
3. 프로젝트 초기화 (Next.js 16 + Firebase)
4. 핵심 기능 구현:
   - Google 로그인
   - 프로젝트 CRUD (생성/보관/삭제)
   - 기록 CRUD (피드백/아이디어/할일/로그/명령어)
   - Quick Capture 입력바
   - 프로젝트 정보 보기/편집 모달 (기술스택, 도메인, 링크 등)
   - 필터 탭 (전체/피드백/아이디어/할일/로그/명령어)
   - 프로젝트 카드 파스텔 배경색
   - 프로젝트 로고 업로드 (base64)
5. 전체 한글화
6. 모바일 퍼스트 반응형 + safe area 대응
7. Vercel 배포 완료 + Firebase Auth authorized domain 설정
8. Claude Code에서 Firestore에 프로젝트 정보 직접 입력 (tapstamp, vibe-note)

## 미완성 / 다음에 할 것
1. **PWA 설정** — @serwist/next Service Worker 설정 (오프라인 지원)
2. **프로젝트 동기화 스크립트** — `.vibenote.json` + 자동 기술스택 감지 → Firestore 전송
3. **에러 토스트** — 현재 TODO로 남아있음 (QuickCapture.tsx, ProjectEditModal.tsx)
4. **Inbox 기능** — Home에서 미분류 기록을 프로젝트로 이동하는 UI
5. **church-note** — 와이프 교회 활동 노트 앱 (별개 프로젝트, /office-hours로 기획 예정)

## 디자인 문서
- ~/.gstack/projects/vibe-note/senn-unknown-design-20260413-231847.md (APPROVED)

## 알아둘 것
- Firebase 프로젝트 ID: `vibe-note` (변경 불가)
- GitHub 레포: `woohyee/vibenote` (vibe_note에서 rename함)
- Vercel 프로젝트: `vibe-note` (Framework: Next.js로 변경 완료)
- Firebase UID: `r34Iw0h3cQhLiUhuM7OAt3b0Dru1`
- SYNC_API_KEY: `vn-sync-2026-senn-secret`
- Firestore 경로: `users/{uid}/projects/`, `users/{uid}/records/` (단일 컬렉션)
