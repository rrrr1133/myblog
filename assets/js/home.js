requireAuth();

const postGrid = document.querySelector('.post-grid');
const emptyState = document.getElementById('empty-state');
const btnWrite = document.querySelector('.btn-write');
const btnLogout = document.querySelector('.btn-logout');
const aboutName = document.querySelector('.about-name');
const btnLoadMore = document.getElementById('btn-load-more');

const POSTS_PER_PAGE = 6;
let allPosts = [];
let rawPosts = [];
let shownCount = POSTS_PER_PAGE;

// 로그인한 사용자 이름 표시
if (aboutName) {
  aboutName.textContent = getUsername() || 'User';
}

// Write 버튼
if (btnWrite) {
  btnWrite.addEventListener('click', () => {
    window.location.href = './post-write.html';
  });
}

// Logout 버튼
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    clearAuth();
    window.location.href = './index.html';
  });
}

// Top 버튼
const btnTop = document.querySelector('.btn-top');
if (btnTop) {
  btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function createPostCard(post) {
  const thumbnail = post.thumbnail || getRandomPostImg();
  const dateStr = formatDate(post.date);
  const excerpt = post.content ? post.content.slice(0, 80) + (post.content.length > 80 ? '...' : '') : '';

  const article = document.createElement('article');
  article.className = 'post-card';
  article.style.cursor = 'pointer';
  article.innerHTML = `
    <div class="post-img" style="background-image: url('${thumbnail}')"></div>
    <h2 class="post-title">${post.title || '(제목 없음)'}</h2>
    <div class="post-author">
      <div class="author-avatar"><img src="./assets/img/profile.png" alt="author" /></div>
      <span class="author-name">${post.author || ''}</span>
      <div class="author-divider"></div>
      <span class="post-date">${dateStr}</span>
    </div>
    <p class="post-excerpt">${excerpt}</p>
  `;
  article.addEventListener('click', () => {
    const dbId = post.index ? String(post.index) : String(rawPosts.indexOf(post) + 1);
    sessionStorage.setItem('currentPost', JSON.stringify({ ...post, _dbId: dbId }));
    const navId = post.index || post.id || post._id;
    window.location.href = `./post-view.html?id=${navId}`;
  });
  return article;
}

function renderPosts() {
  // 기존 row 초기화 (empty-state 제외)
  Array.from(postGrid.children).forEach((child) => {
    if (!child.id || child.id !== 'empty-state') child.remove();
  });

  if (!allPosts.length) {
    emptyState.style.display = 'block';
    if (btnLoadMore) btnLoadMore.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';

  // shownCount만큼만 렌더링
  const visible = allPosts.slice(0, shownCount);
  for (let i = 0; i < visible.length; i += 3) {
    const row = document.createElement('div');
    row.className = 'post-row';
    visible.slice(i, i + 3).forEach((post) => row.appendChild(createPostCard(post)));
    postGrid.appendChild(row);
  }

  // 더보기 버튼: 남은 포스트 있으면 표시
  if (btnLoadMore) {
    btnLoadMore.style.display = shownCount < allPosts.length ? 'block' : 'none';
  }

  // 레이아웃 높이 동적 조정
  const wrapper = document.querySelector('.content-wrapper');
  const background = document.querySelector('.background');
  if (wrapper && background) {
    const wrapperH = wrapper.offsetHeight;
    background.style.marginBottom = Math.max(100, wrapperH - 420 + 321 + 60) + 'px';
  }
}

// 더보기 버튼 클릭 시 6개 추가 로드
if (btnLoadMore) {
  btnLoadMore.addEventListener('click', () => {
    const prevCount = shownCount;
    shownCount += POSTS_PER_PAGE;
    renderPosts();
    // 새로 나타난 첫 번째 row로 부드럽게 스크롤
    const rows = postGrid.querySelectorAll('.post-row');
    const targetRow = rows[Math.floor(prevCount / 3)];
    if (targetRow) targetRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

async function loadPosts() {
  try {
    const res = await fetch(API_BASE + '/blog', { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
    const posts = await res.json();

    // 원본 배열 보관 (_dbId 계산에 사용)
    rawPosts = posts;
    // title이 없는 soft-delete 항목 제외, 없으면 localStorage 폴백
    const validPosts = posts.filter(p => p.title);
    allPosts = validPosts.length > 0 ? validPosts : getLocalPosts(getUsername());
    shownCount = POSTS_PER_PAGE;
    renderPosts();
  } catch {
    emptyState.style.display = 'block';
    emptyState.textContent = '포스트를 불러오는 데 실패했습니다.';
    if (btnLoadMore) btnLoadMore.style.display = 'none';
  }
}

loadPosts();
