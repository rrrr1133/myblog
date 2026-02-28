const API_BASE = 'https://dev.wenivops.co.kr/services/fastapi-crud/1';

function getToken() {
  return localStorage.getItem('token');
}

function getUsername() {
  return localStorage.getItem('username');
}

function setAuth(token, username) {
  localStorage.setItem('token', token);
  localStorage.setItem('username', username);
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = './index.html';
  }
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(API_BASE + endpoint, {
    ...options,
    headers,
  });
  return response;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '.');
}

function getRandomThumbnail() {
  const n = Math.floor(Math.random() * 6) + 1;
  return `./assets/img/post-background${n}.png`;
}

// localStorage 포스트 관리
function getLocalPosts(username) {
  return JSON.parse(localStorage.getItem(`posts_${username}`) || '[]');
}

function saveLocalPost(post, username) {
  const posts = getLocalPosts(username);
  const key = post.id || post._id || String(post.index);
  const idx = posts.findIndex(p => (p.id || p._id || String(p.index)) === key);
  if (idx >= 0) { posts[idx] = post; } else { posts.push(post); }
  localStorage.setItem(`posts_${username}`, JSON.stringify(posts));
}

function deleteLocalPost(postId, username) {
  const posts = getLocalPosts(username);
  localStorage.setItem(`posts_${username}`, JSON.stringify(
    posts.filter(p => p.id !== postId && p._id !== postId && String(p.index) !== String(postId))
  ));
}

// 로고 클릭 네비게이션 (전 페이지 공통)
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    if (getToken()) {
      window.location.href = './home.html';
    } else {
      window.location.href = './index.html';
    }
  });
});
