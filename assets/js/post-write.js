requireAuth();

// 배너 날짜 표시
(function () {
  const now = new Date();
  const monthNames = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const elMonthDay = document.getElementById('banner-date-monthday');
  const elDay = document.getElementById('banner-date-day');
  if (elMonthDay) elMonthDay.textContent = `${monthNames[now.getMonth()]} ${now.getDate()}`;
  if (elDay) elDay.textContent = dayNames[now.getDay()];
})();

const params = new URLSearchParams(window.location.search);
const postId = params.get('id');
const isEditMode = !!postId;

// DOM 요소
const titleInput = document.querySelector('.write-title');
const contentTextarea = document.querySelector('.write-content');
const btnSaveHeader = document.querySelector('.btn-save');
const btnSaveDraft = document.querySelector('.btn-save-draft');
const btnAiDraft = document.getElementById('btn-ai-draft');
const btnBack = document.querySelector('.btn-back');
const btnDeletePost = document.querySelector('.btn-delete-post');
const btnLogout = document.querySelector('.btn-logout');
const btnTop = document.querySelector('.btn-top');
const form = document.querySelector('form');

// 삭제 모달
const deleteModal = document.getElementById('write-delete-modal');
const btnWriteCancel = document.getElementById('btn-write-cancel');
const btnWriteDelete = document.getElementById('btn-write-delete');

// 토스트
const toast = document.getElementById('write-toast');

// 발행 버튼 활성화 체크
function checkFields() {
  const filled = titleInput.value.trim() && contentTextarea.value.trim();
  const hasTitle = !!titleInput.value.trim();
  if (btnSaveHeader) btnSaveHeader.disabled = !filled;
  if (btnSaveDraft)  btnSaveDraft.disabled  = !filled;
  if (btnAiDraft)    btnAiDraft.disabled    = !hasTitle;
}

titleInput.addEventListener('input', checkFields);
contentTextarea.addEventListener('input', checkFields);

// 초기 비활성화
if (btnSaveHeader) btnSaveHeader.disabled = true;
if (btnSaveDraft) btnSaveDraft.disabled = true;

// Back 버튼
if (btnBack) {
  btnBack.addEventListener('click', () => {
    if (isEditMode) {
      window.location.href = `./post-view.html?id=${postId}`;
    } else {
      window.location.href = './home.html';
    }
  });
}

// Logout
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    clearAuth();
    window.location.href = './index.html';
  });
}

// Top
if (btnTop) {
  btnTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// 삭제 모달 열기
if (btnDeletePost) {
  btnDeletePost.addEventListener('click', () => {
    deleteModal.style.display = 'flex';
  });
}

// 모달 취소
if (btnWriteCancel) {
  btnWriteCancel.addEventListener('click', () => {
    deleteModal.style.display = 'none';
  });
}

// 모달 바깥 클릭 닫기
if (deleteModal) {
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) deleteModal.style.display = 'none';
  });
}

// 모달 삭제 확인
if (btnWriteDelete) {
  btnWriteDelete.addEventListener('click', async () => {
    if (!isEditMode) {
      window.location.href = './home.html';
      return;
    }
    try {
      const res = await apiFetch(`/blog/${postId}`, { method: 'DELETE' });
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

// 토스트 표시 함수
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// API 저장 함수
async function savePost() {
  const title = titleInput.value.trim();
  const content = contentTextarea.value.trim();
  if (!title || !content) return null;

  let bodyObj;
  if (isEditMode) {
    const existing = getLocalPosts(getUsername()).find(
      p => String(p.index) === String(postId) || p.id === postId || p._id === postId
    );
    bodyObj = {
      title, content,
      author: existing?.author || getUsername(),
      date: existing?.date || '',
    };
  } else {
    bodyObj = {
      title,
      content,
      author: getUsername(),
      date: new Date().toISOString().split('T')[0],
    };
  }

  const body = JSON.stringify(bodyObj);
  let res;

  if (isEditMode) {
    res = await apiFetch(`/blog/${postId}`, { method: 'PUT', body });
  } else {
    res = await apiFetch('/blog', { method: 'POST', body });
  }

  if (!res.ok) throw new Error('save failed');
  const result = await res.json();

  if (!isEditMode) {
    // 새 글: localStorage에 저장
    saveLocalPost({ ...bodyObj, id: result.id, _id: result._id, index: result.index }, getUsername());
  } else {
    // 수정: localStorage 기존 포스트 title/content 업데이트
    const existing = getLocalPosts(getUsername()).find(
      p => p.id === postId || p._id === postId || String(p.index) === String(postId)
    );
    if (existing) saveLocalPost({ ...existing, title, content }, getUsername());
  }

  return result;
}

// 임시저장 버튼 — 저장 후 페이지 유지
if (btnSaveDraft) {
  btnSaveDraft.addEventListener('click', async () => {
    try {
      const data = await savePost();
      if (data && !isEditMode) {
        // 새 글이면 URL을 편집 모드로 업데이트
        const newId = data.index;
        if (newId) {
          history.replaceState(null, '', `?id=${newId}`);
          params.set('id', newId);
        }
      }
      showToast('저장되었습니다.');
    } catch {
      alert('저장에 실패했습니다.');
    }
  });
}

// 저장 버튼 (헤더) — 저장 후 이동
async function saveAndNavigate() {
  try {
    const data = await savePost();
    if (!data) return;

    if (isEditMode) {
      // 수정 완료: 기존 ID로 상세 페이지 이동
      window.location.href = `./post-view.html?id=${postId}`;
    } else {
      // 신규 포스트: sessionStorage에 저장 후 상세 페이지로 직접 이동
      const username = getUsername();
      const newPost = {
        title: titleInput.value.trim(),
        content: contentTextarea.value.trim(),
        author: username,
        date: new Date().toISOString().split('T')[0],
        id: data.id,
        _id: data._id,
        index: data.index,
      };

      // GET /blog로 새 포스트의 배열 위치(=db_id) 계산 — 삭제 기능에 사용
      try {
        const listRes = await fetch(API_BASE + '/blog', { cache: 'no-store' });
        if (listRes.ok) {
          const posts = await listRes.json();
          const idx = posts.findIndex(p => p.id === data.id || p._id === data.id);
          if (idx >= 0) newPost._dbId = String(idx + 1);
        }
      } catch {}

      const navId = data.id || data._id;
      if (navId) {
        sessionStorage.setItem('currentPost', JSON.stringify(newPost));
        window.location.href = `./post-view.html?id=${navId}`;
      } else {
        window.location.href = './home.html';
      }
    }
  } catch {
    alert('저장에 실패했습니다.');
  }
}

if (btnSaveHeader) btnSaveHeader.addEventListener('click', saveAndNavigate);

// 폼 submit 방지
if (form) {
  form.addEventListener('submit', (e) => e.preventDefault());
}

// AI 초안 생성
async function generateDraft() {
  const title = titleInput.value.trim();
  if (!title) return;

  const originalText = btnAiDraft.textContent;
  btnAiDraft.disabled = true;
  btnAiDraft.textContent = '⏳ 생성 중...';

  try {
    const messages = [
      {
        role: 'system',
        content:
          '당신은 블로그 글 작성을 도와주는 AI 어시스턴트입니다. ' +
          '사용자가 블로그 제목을 제공하면, 그 제목에 맞는 자연스럽고 흥미로운 블로그 글 초안을 ' +
          '한국어로 작성해주세요. 마크다운 형식 없이 일반 텍스트로 작성해주세요.',
      },
      {
        role: 'user',
        content: `블로그 제목: "${title}"\n\n이 제목으로 블로그 포스트 초안을 작성해주세요.`,
      },
    ];

    const res = await fetch('https://dev.wenivops.co.kr/services/openai-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (!res.ok) throw new Error('AI 응답 실패');

    const data = await res.json();
    const generated =
      data?.choices?.[0]?.message?.content ||
      data?.content ||
      '';

    if (!generated) throw new Error('내용 없음');

    contentTextarea.value = generated;
    checkFields();
    showToast('AI 초안이 생성되었습니다.');
  } catch {
    alert('AI 초안 생성에 실패했습니다. 다시 시도해주세요.');
  } finally {
    btnAiDraft.textContent = originalText;
    checkFields();
  }
}

if (btnAiDraft) {
  btnAiDraft.addEventListener('click', generateDraft);
}

// 편집 모드: 기존 내용 불러오기
async function loadPost() {
  if (!isEditMode) return;
  try {
    const res = await apiFetch(`/blog/${postId}`);
    if (!res.ok) {
      window.location.href = './home.html';
      return;
    }
    const post = await res.json();
    titleInput.value = post.title || '';
    contentTextarea.value = post.content || '';
    checkFields();
  } catch {
    window.location.href = './home.html';
  }
}

loadPost();
