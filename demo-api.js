async function submitDemo(kind, data) {
  const response = await fetch('/api/submissions?kind=' + kind, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Please try again.');
  return result;
}
async function submitForm(form, status, kind, data, message) {
  const button = form.querySelector('button[type="submit"], button.button');
  button.disabled = true;
  status.textContent = 'Submitting…';
  try {
    const result = await submitDemo(kind, data);
    status.textContent = message + ' Reference ' + result.id.slice(0,8) + '.';
    form.reset();
    return result;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}
