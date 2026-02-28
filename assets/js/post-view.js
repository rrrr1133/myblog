requireAuth();

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
      const res = await apiFetch(`/blog/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        deleteLocalPost(postId, getUsername());
        window.location.href = './home.html';
      } else {
        alert('삭제에 실패했습니다.');
        deleteModal.style.display = 'none';
      }
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

function renderPost(post) {
  document.title = post.title || 'Post View';
  if (postTitle) postTitle.textContent = post.title || '';
  if (authorName) authorName.textContent = post.author || '';
  if (postDate) postDate.textContent = formatDate(post.date);
  if (post.author === getUsername() && postActions) {
    postActions.style.display = 'flex';
  }
  if (post.thumbnail && contentImg) {
    contentImg.style.backgroundImage = `url('${post.thumbnail}')`;
    contentImg.style.display = 'block';
  } else if (contentImg) {
    contentImg.style.display = 'none';
  }
  if (postContent) postContent.textContent = post.content || '';
}

async function loadPost() {
  try {
    const cached = sessionStorage.getItem('currentPost');
    sessionStorage.removeItem('currentPost');

    // UUID(숫자가 아닌 ID)이면 sessionStorage 데이터 사용
    if (postId && !/^\d+$/.test(postId)) {
      if (cached) { renderPost(JSON.parse(cached)); return; }
      window.location.href = './home.html';
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
