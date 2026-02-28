# myblog

> 자신의 지식과 경험을 글로 작성하고 공유할 수 있는 블로그 플랫폼

---

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [배포 URL](#배포-url)
- [기술 스택](#기술-스택)
- [기능](#기능)
- [프로젝트 구조](#프로젝트-구조)
- [URL 구조](#url-구조)
- [API 명세](#api-명세)
- [요구사항 명세](#요구사항-명세)
- [화면 설계](#화면-설계)
- [에러와 에러 해결](#에러와-에러-해결)
- [개발하면서 느낀점](#개발하면서-느낀점)
- [추후 개발 사항](#추후-개발-사항)

---

## 프로젝트 소개

위니브 블로그는 블로그 플랫폼을 직접 구현해 보는 **개인 프로젝트**입니다.  
포스트를 작성하고, **AI의 도움을 받아 글을 더 쉽게 완성**할 수 있습니다.

- **AI 기능**: 블로그 제목을 입력하면 ChatGPT API가 본문 초안을 자동으로 작성해줍니다.
- **인증 방식**: JWT 토큰 기반 로그인/회원가입
- **레이아웃**: 사이드바(프로필, 카테고리, SNS) + 메인(포스트 목록) 구성

---

## 배포 URL

> https://rrrr1133.github.io/myblog/home.html

---

## 기술 스택

- **HTML / CSS / JavaScript** — Vanilla JS 멀티페이지 구조
- **ChatGPT API** — AI 블로그 초안 작성 기능
- **GitHub Pages** — 배포

---

## 기능

### 회원가입 / 로그인

- `username`과 `password`로 회원가입 및 로그인
- 로그인 성공 시 JWT 토큰 저장 및 이후 요청에 활용
- 입력값이 모두 채워져야 버튼 활성화
- 로그인 실패 시 경고 문구 표시
- 로그인 상태에 따라 Write / Logout 버튼 표시 분기 처리

### 블로그 목록 페이지 (홈)

- 전체 포스트 목록 표시 (썸네일, 제목, 작성자, 작성일)
- 포스트가 없을 경우 "아직 작성된 글이 없습니다." 문구 표시
- 더보기 버튼으로 추가 포스트 로드
- 사이드바: 프로필 / 카테고리 (Life, Style, Tech, Music, Sport, Photo, Develop) / SNS 팔로우 (Facebook, Twitter, Instagram, GitHub)

### 포스트 상세 페이지

- 제목, 작성자, 작성일, 썸네일(없을 경우 랜덤 이미지), 본문 표시
- 내가 작성한 포스트일 경우 수정 / 삭제 버튼 표시
- 삭제 시 확인 모달 표시 → 확인 후 목록 페이지로 이동

### 포스트 작성 / 수정 페이지

- 제목과 본문이 모두 입력되면 `발행` 버튼 활성화
- 수정 페이지에서는 기존 내용이 입력창에 미리 채워짐
- Write 버튼은 로그인 상태에서만 표시

### AI 기능 (초안 작성)

- 블로그 제목 입력 시 ChatGPT API를 통해 본문 초안 자동 생성
- 생성된 초안은 직접 수정 가능

---

## 프로젝트 구조

```
myblog/
├── index.html               # 로그인 (GitHub Pages 진입점)
├── home.html                # 블로그 목록 (홈)
├── register.html            # 회원가입
├── mypage.html              # 마이페이지
├── post-view.html           # 포스트 상세
├── post-write.html          # 포스트 작성 / 수정 (edit mode 겸용)
├── .nojekyll                # GitHub Pages Jekyll 비활성화
│
└── assets/
    ├── css/
    │   ├── reset.css
    │   ├── login.css
    │   ├── home.css
    │   ├── mypage.css
    │   ├── post-view.css
    │   ├── post-write.css
    │   └── register.css
    ├── js/
    │   ├── api.js           # 공통 API 함수, 인증, localStorage 유틸
    │   ├── login.js         # 로그인 폼 처리
    │   ├── register.js      # 회원가입 폼 처리
    │   ├── home.js          # 홈 포스트 목록 렌더링
    │   ├── post-view.js     # 포스트 상세 / 삭제
    │   └── post-write.js    # 포스트 작성 / 수정 / AI 초안
    └── img/
        ├── Logo.svg
        ├── background 1.png
        ├── profile.png / noimg.png
        ├── post-background1.png ~ post-background6.png  # 포스트 상세 랜덤 배경
        ├── post-img1.png ~ post-img6.png                # 홈 카드 랜덤 썸네일
        ├── ArrowTop.svg / ArrowLeft-blue.png
        ├── Facebook.svg / Twitter.svg / Instagram.svg / Github.svg
        ├── icon-login.svg / icon-register.svg / icon-logout.svg
        ├── icon-modify.svg / icon-modify-white.svg
        ├── icon-delete-white.svg / icon-save.svg / icon-save-white.svg
        └── icon-like.svg / icon-like-white.svg / icon-image.svg
```

---

## URL 구조

|      페이지      | URL                        |
| :--------------: | :------------------------- |
| 블로그 목록 (홈) | `/home.html`               |
|      로그인      | `/index.html`              |
|     회원가입     | `/register.html`           |
|   포스트 상세    | `/post-view.html?id={ID}`  |
|   포스트 작성    | `/post-write.html`         |
|   포스트 수정    | `/post-write.html?id={ID}` |

### 접근 권한

|    권한     | 페이지                            |
| :---------: | :-------------------------------- |
|    공개     | 홈, 로그인, 회원가입, 포스트 상세 |
| 로그인 필요 | 포스트 작성, 수정, 삭제           |

---

## API 명세

**Base URL** : `https://dev.wenivops.co.kr/services/fastapi-crud/1`

|    기능     |  메서드  | 엔드포인트   |
| :---------: | :------: | :----------- |
|  회원가입   |  `POST`  | `/signup`    |
|   로그인    |  `POST`  | `/login`     |
| 블로그 목록 |  `GET`   | `/blog`      |
| 게시글 상세 |  `GET`   | `/blog/{id}` |
| 게시글 작성 |  `POST`  | `/blog`      |
| 게시글 수정 |  `PUT`   | `/blog/{id}` |
| 게시글 삭제 | `DELETE` | `/blog/{id}` |

---

## 요구사항 명세

### 필수 과제

#### 회원가입 / 로그인

- [x] username, password로 회원가입 및 로그인
- [x] 로그인 성공 시 토큰 저장 및 이후 요청에 활용
- [x] 입력값 미입력 시 버튼 비활성화
- [x] 로그인 실패 시 경고 문구 표시

#### 블로그 목록 페이지

- [x] 전체 포스트 목록 표시 (썸네일, 제목, 작성자, 작성일)
- [x] 포스트 없을 시 "아직 작성된 글이 없습니다." 안내 문구 표시
- [x] 더보기 버튼 구현

#### 포스트 상세 페이지

- [x] 제목, 작성자, 작성일, 썸네일, 본문 표시
- [x] 썸네일 없을 경우 랜덤 이미지 표시
- [x] 본인 포스트에만 수정/삭제 버튼 표시
- [x] 삭제 확인 모달 → 목록으로 이동

#### 포스트 작성 / 수정 페이지

- [x] 제목 + 본문 모두 입력 시 발행 버튼 활성화
- [x] 수정 페이지에서 기존 내용 미리 채우기

#### AI 기능 (초안 작성)

- [x] 제목 입력 시 ChatGPT API로 본문 초안 자동 생성

---

## 화면 설계

|              홈 (블로그 목록)               |                    로그인                    |
| :-----------------------------------------: | :------------------------------------------: |
|   ![홈](./assets/img/screenshot-home.png)   | ![로그인](./assets/img/screenshot-login.png) |
|                 포스트 상세                 |                 포스트 작성                  |
| ![상세](./assets/img/screenshot-detail.png) |  ![작성](./assets/img/screenshot-write.png)  |

> 스크린샷 이미지는 실제 캡처 후 `assets/img/` 폴더에 추가해 주세요.

---

## 에러와 에러 해결

### 포스트 데이터 하드코딩 문제

**발생 상황**  
포스트 상세 페이지에서 일부 데이터가 고정값으로 표시됨

**원인**  
HTML에 초기 더미 텍스트를 직접 작성해두어 API 응답과 무관하게 표시됨

**해결**  
페이지 진입 시 `URLSearchParams`로 `id`를 추출하여 `/blog/{id}` API를 호출하고, 응답 데이터로 동적 렌더링하도록 수정

---

### sessionStorage 이전 데이터 잔존 문제

**발생 상황**  
작성 페이지에서 수정 후 재진입 시 이전 임시 데이터가 잔존하여 잘못된 내용이 표시됨

**원인**  
페이지 이동 후 `sessionStorage`에 저장한 임시 데이터를 삭제하지 않음

**해결**  
발행/취소 시 `sessionStorage.removeItem()`으로 데이터 정리

---

### 비로그인 상태에서 Write/삭제 버튼 노출 문제

**발생 상황**  
비로그인 상태에서도 Write 버튼이 노출되거나 삭제 요청이 가능한 상태

**원인**  
로그인 상태 체크 없이 버튼을 무조건 렌더링

**해결**  
`localStorage`의 토큰 유무로 로그인 상태를 확인하고, 로그인 상태에서만 버튼을 표시하도록 분기 처리

---

## 개발하면서 느낀점

1차 프로젝트를 개인으로 진행할 때는 해결하기 어려운 문제에 부딪히면 오로지 인터넷 검색에 의존하거나 혼자 끙끙 앓으며 해결해야 했기에, 막막함과 심리적 부담감이 커서 힘든 순간이 많았다.

이번 팀 프로젝트(HODU_MARKET)를 수행하면서는 나보다 앞서 나가는 팀원에게 조언을 구해 효율적으로 문제를 해결할 수 있었고, 모두가 답을 찾기 어려운 상황에서는 함께 머리를 맞대고 고민하며 최선의 방향을 찾아 나아갈 수 있었다. 이런 집단지성의 과정이 서로에게 큰 의지가 되었음은 물론, 혼자였다면 포기했을 상황에서도 다시 나아갈 수 있는 원동력이 되어 프로젝트 완수에 큰 도움이 되었다고 생각한다.

이번 개인 프로젝트에서는 팀에서 익힌 **API 연동, 로그인 상태 분기 처리, sessionStorage 활용** 패턴을 혼자서도 직접 적용해보며, 스스로 문제를 발견하고 해결하는 경험을 쌓을 수 있었다.

---

## 추후 개발 사항

- [ ] 카테고리 필터 기능 (Life, Style, Tech, Music 등 실제 필터링)
- [ ] 댓글 기능 추가
- [ ] 검색 기능
- [ ] SNS 팔로우 링크 연동
- [ ] AI 기능 확장 (글 요약, 글 검토, 글 이어쓰기)
- [ ] 다크모드 지원
