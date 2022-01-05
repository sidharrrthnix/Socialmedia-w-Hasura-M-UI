async function handleImageUpload(image, imageType) {
  const data = new FormData();
  data.append("file", image);
  data.append(
    "upload_preset",
    imageType === "avatar" ? "i-avatar" : "instagram"
  );
  data.append("cloud_name", "di5gvklsp");
  const response = await fetch(
    "https://api.cloudinary.com/v1_1/di5gvklsp/image/upload",
    {
      method: "POST",
      accept: "application/json",
      body: data,
    }
  );
  const jsonResponse = await response.json();
  return jsonResponse.url;
}
export default handleImageUpload;
