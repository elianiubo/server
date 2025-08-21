async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "YOUR_UNSIGNED_PRESET"); // desde Cloudinary
  formData.append("folder", "portfolio"); // opcional

  const response = await fetch("https://api.cloudinary.com/v1_1/dcgj0tvya/image/upload", {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  return data.secure_url; // esta es la URL final
}