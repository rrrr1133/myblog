requireAuth();

let currentPost = null;
let realDeleteId = null;

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

if (!postId) {
  window.location.href = './home.html';
}

// DOM 요소
const btnBack = document.querySelector('.btn-back');
const btnWrite = document.querySelector('.btn-write');
const btnLogout = document.querySelector('.btn-logout');
const btnTop = document.querySelector('.btn-top');
const postActions = document.getElementById('post-actions');
const btnModify = document.querySelector('.btn-modify');
const btnDelete = document.querySelector('.btn-delete');
const authorName = document.getElementById('post-author-name');
const postDate = document.getElementById('post-date');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const contentImg = document.getElementById('post-content-img');
const deleteModal = document.getElementById('delete-modal');
const btnModalCancel = document.getElementById('btn-modal-cancel');
const btnModalConfirm = document.getElementById('btn-modal-confirm');

// 버튼 이벤트
if (btnBack) btnBack.addEventListener('click', () => { window.location.href = './home.html'; });
if (btnWrite) btnWrite.addEventListener('click', () => { window.location.href = './post-write.html'; });
if (btnLogout) btnLogout.addEventListener('click', () => { clearAuth(); window.location.href = './index.html'; });
if (btnTop) btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// 수정 버튼
if (btnModify) {
  btnModify.addEventListener('click', () => {
    window.location.href = `./post-write.html?id=${postId}`;
  });
}

// 삭제 모달
if (btnDelete) {
  btnDelete.addEventListener('click', () => {
    deleteModal.style.display = 'flex';
  });
}

if (btnModalCancel) {
  btnModalCancel.addEventListener('click', () => {
    deleteModal.style.display = 'none';
  });
}

if (btnModalConfirm) {
  btnModalConfirm.addEventListener('click', async () => {
    try {
      const deleteId = realDeleteId || currentPost?.index || postId;
      const res = await apiFetch(`/blog/${deleteId}`, { method: 'DELETE' });
      deleteLocalPost(postId, getUsername());
      if (res.status === 401) {
        clearAuth();
        window.location.href = './index.html';
        return;
      }
      window.location.href = './home.html';
    } catch {
      alert('서버 연결에 실패했습니다.');
      deleteModal.style.display = 'none';
    }
  });
}

// 모달 바깥 클릭 시 닫기
if (deleteModal) {
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });
}

function isMyPost(post) {
  if (post.author && post.author === getUsername()) return true;
  const localPosts = getLocalPosts(getUsername());
  return localPosts.some(p =>
    (post.id && p.id === post.id) ||
    (post._id && (p.id === post._id || p._id === post._id)) ||
    (postId && (p.id === postId || p._id === postId || String(p.index) === String(postId)))
  );
}

function renderPost(post) {
  currentPost = post;
  document.title = post.title || 'Post View';
  if (postTitle) postTitle.textContent = post.title || '';
  if (authorName) authorName.textContent = post.author || '';
  if (postDate) postDate.textContent = formatDate(post.date);
  if (isMyPost(post) && postActions) {
    postActions.style.display = 'flex';
  }
  if (contentImg) {
    const imgSrc = post.thumbnail || getRandomThumbnail();
    contentImg.style.backgroundImage = `url('${imgSrc}')`;
    contentImg.style.display = 'block';
  }
  if (postContent) postContent.textContent = post.content || '';
}

async function loadPost() {
  try {
    const cached = sessionStorage.getItem('currentPost');
    sessionStorage.removeItem('currentPost');

    // UUID(숫자가 아닌 ID)이면 sessionStorage 데이터 사용
    if (postId && !/^\d+$/.test(postId)) {
      if (cached) {
        const cachedPost = JSON.parse(cached);
        renderPost(cachedPost);
        // 1순위: home.js가 저장한 db_id
        if (cachedPost._dbId) {
          realDeleteId = String(cachedPost._dbId);
        } else {
          // 2순위: localStorage에 저장된 index
          const localPost = getLocalPosts(getUsername()).find(p => p.id === postId || p._id === postId);
          if (localPost?.index) realDeleteId = String(localPost.index);
        }
      } else {
        window.location.href = './home.html';
      }
      return;
    }

    // 숫자 ID이면 API 호출
    const res = await apiFetch(`/blog/${postId}`);
    if (!res.ok) {
      if (cached) { renderPost(JSON.parse(cached)); return; }
      window.location.href = './home.html';
      return;
    }
    renderPost(await res.json());
  } catch {
    window.location.href = './home.html';
  }
}

loadPost();
