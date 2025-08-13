export function formattedDate() {
  const date = new Date();
  return date.toLocaleDateString('en-UK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

