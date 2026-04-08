import api from "./api";

export const uploadImage = async (file: File, folder = "eventsphere") => {
  try {
    const signatureResponse = await api.get(`/uploads/signature?folder=${encodeURIComponent(folder)}`);
    const payload = signatureResponse.data?.data;

    if (!payload?.cloudName || !payload?.apiKey || !payload?.signature || !payload?.timestamp) {
      throw new Error("Upload service is not configured");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", payload.apiKey);
    formData.append("timestamp", String(payload.timestamp));
    formData.append("signature", payload.signature);
    formData.append("folder", payload.folder);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${payload.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(data?.error?.message || "Upload failed");
    }

    return {
      secureUrl: data.secure_url as string,
      publicId: data.public_id as string,
    };
  } catch (_error) {
    const formData = new FormData();
    formData.append("folder", folder.split("/").pop() || "general");
    formData.append("file", file);

    const localResponse = await api.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!localResponse.data?.success) {
      throw new Error("Upload failed");
    }

    return {
      secureUrl: localResponse.data.data.secureUrl as string,
      publicId: localResponse.data.data.filename as string,
    };
  }
};

export const uploadMedia = async (file: File, folder = "eventsphere") => {
  const isImage = file.type.startsWith("image/");
  if (isImage) {
    const uploaded = await uploadImage(file, folder);
    return {
      ...uploaded,
      mediaType: "image" as const,
    };
  }

  const formData = new FormData();
  formData.append("folder", folder.split("/").pop() || "general");
  formData.append("file", file);

  const response = await api.post("/uploads/media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  if (!response.data?.success) {
    throw new Error("Upload failed");
  }

  return {
    secureUrl: response.data.data.secureUrl as string,
    publicId: response.data.data.filename as string,
    mediaType: response.data.data.mediaType as "image" | "video",
  };
};
