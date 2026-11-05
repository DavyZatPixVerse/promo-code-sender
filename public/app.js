const form = document.querySelector('#claim');
const email = document.querySelector('#email');
const submit = form.querySelector('button');
const submitLabel = document.querySelector('#submit-label');
const message = document.querySelector('#message');
const result = document.querySelector('#result');
const code = document.querySelector('#code');
const copy = document.querySelector('#copy');
let revision = 0;

function clearResult() {
  result.hidden = true;
  code.textContent = '';
  copy.textContent = 'Copy code';
  message.textContent = '';
}

email.addEventListener('input', () => {
  revision += 1;
  clearResult();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;
  clearResult();
  const current = ++revision;
  submit.disabled = true;
  submitLabel.textContent = 'Looking up your code…';
  try {
    const response = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });
    const data = await response.json();
    if (current !== revision) return;
    if (!response.ok) {
      message.textContent = data.error || 'We couldn’t look up your code. Please try again.';
      return;
    }
    code.textContent = data.code;
    result.hidden = false;
    code.focus();
  } catch {
    if (current === revision) message.textContent = 'We couldn’t look up your code. Please try again.';
  } finally {
    submit.disabled = false;
    submitLabel.textContent = 'Get my code';
  }
});

copy.addEventListener('click', async () => {
  const current = revision;
  try {
    await navigator.clipboard.writeText(code.textContent);
    if (current === revision) copy.textContent = 'Copied!';
  } catch {
    if (current !== revision) return;
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    message.textContent = 'Copy the selected code manually.';
  }
});
