# Project Overview
10~20대 타겟의 "AI 퍼스널 무드 & OOTD 진단기". 구글 Teachable Machine(Image Model)을 활용하여 사용자의 옷차림/스타일 사진을 분석하고, 2026 트렌드 무드(긱시크, 고프코어, 올드머니 등)를 판별해 주는 웹 기반 심리테스트/진단 서비스.

# Architecture & Tech Stack
- Frontend Only: 완전한 정적 페이지 (HTML5, CSS3, Vanilla JS)
- No Backend, No Server: 모든 로직은 클라이언트(브라우저)에서 처리됨. API 연동 없음.
- Model: `@teachablemachine/image` 라이브러리를 CDN으로 로드하여 사용.
- Styling: 최신 모바일 웹 트렌드 반영 (다크 모드 베이스, 네온 포인트, 깔끔한 둥근 UI). 별도 프레임워크 없이 순수 CSS(또는 Tailwind CDN) 사용.

# Coding Guidelines
- 모든 파일은 루트 디렉토리에 위치: `index.html`, `style.css`, `app.js`
- JS 작성 규칙: ES6+ 문법(const/let, Arrow Function, Async/Await) 필수 사용.
- DOM 조작: Vanilla JS의 `document.querySelector` 등을 활용.
- 모바일 퍼스트(Mobile-First): 미디어 쿼리를 사용해 모바일 화면(최대 width 500px)에서 앱처럼 보이도록 중앙 정렬 및 패딩 적용.
- 사용자 경험(UX): 사진 업로드 후 AI 분석 중일 때 반드시 '로딩 애니메이션/텍스트'를 보여줄 것.

# Target Audiences (10s - 20s)
결과 텍스트는 딱딱하지 않게, 요즘 유행하는 밈(Meme)이나 트렌디한 어투(ex. "완전 럭키비키잖아", "핀터레스트 재질")를 적극 활용.

