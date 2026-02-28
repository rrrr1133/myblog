const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.querySelector('.btn-login');
const errorMsg = document.getElementById('login-error');
const form = document.querySelector('form');

function checkInputs() {
  const filled = usernameInput.value.trim() && passwordInput.value.trim();
  loginBtn.disabled = !filled;
}

usernameInput.addEventListener('input', checkInputs);
usernameInput.addEventListener('change', checkInputs);
passwordInput.addEventListener('input', checkInputs);
passwordInput.addEventListener('change', checkInputs);
loginBtn.disabled = true;
setTimeout(checkInputs, 100);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim(),
      }),
    });

    if (!res.ok) {
      errorMsg.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
      return;
    }

    const data = await res.json();
    const token = data.access_token || data.token || data.access;
    if (!token) {
      errorMsg.textContent = '로그인에 실패했습니다. 다시 시도해주세요.';
      return;
    }

    setAuth(token, usernameInput.value.trim());
    window.location.href = './home.html';
  } catch {
    errorMsg.textContent = '서버 연결에 실패했습니다.';
  }
});
