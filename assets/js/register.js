const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const registerBtn = document.querySelector('.btn-register');
const errorMsg = document.getElementById('register-error');
const form = document.querySelector('form');

function checkInputs() {
  const filled = usernameInput.value.trim() && passwordInput.value.trim();
  registerBtn.disabled = !filled;
}

usernameInput.addEventListener('input', checkInputs);
passwordInput.addEventListener('input', checkInputs);
registerBtn.disabled = true;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim(),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      errorMsg.textContent = data.detail || '회원가입에 실패했습니다. 이미 사용 중인 아이디일 수 있습니다.';
      return;
    }

    window.location.href = './index.html';
  } catch {
    errorMsg.textContent = '서버 연결에 실패했습니다.';
  }
});
