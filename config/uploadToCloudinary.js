async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "YOUR_UNSIGNED_PRESET"); // desde Cloudinary
  formData.append("folder", "portfolio"); // opcional
  const MAX_MB = 8;
  const ALLOWED = ["image/jpeg", "image/png", "image/webp", 'image/jpg'];

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) throw new Error("Formato no permitido");
    if (file.size > MAX_MB * 1024 * 1024) throw new Error("Archivo demasiado grande");
  }
  const response = await fetch("https://api.cloudinary.com/v1_1/dcgj0tvya/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  return data.secure_url; // esta es la URL final
}