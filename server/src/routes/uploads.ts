import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import { protect } from "../middleware/auth";
import cloudinary from "../config/cloudinary";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");

const ensureFolder = (folderName: string) => {
  const safeFolder = folderName.replace(/[^a-zA-Z0-9_-]/g, "");
  const fullPath = path.join(uploadsRoot, safeFolder || "general");
  fs.mkdirSync(fullPath, { recursive: true });
  return { safeFolder: safeFolder || "general", fullPath };
};

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const folderParam = typeof req.body.folder === "string" ? req.body.folder : "general";
    const { fullPath } = ensureFolder(folderParam);
    cb(null, fullPath);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeBase = path
      .basename(file.originalname || "upload", ext)
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .slice(0, 60);
    cb(null, `${Date.now()}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

const mediaUpload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, PNG, WEBP, MP4, MOV, and WEBM files are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.get("/signature", protect, async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(400).json({ success: false, message: "Cloudinary is not configured" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = req.query.folder ? String(req.query.folder) : "eventsphere";
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      data: {
        timestamp,
        folder,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/remote", protect, async (req, res) => {
  try {
    const { fileUrl, folder = "eventsphere" } = req.body;
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: "fileUrl is required" });
    }

    const result = await cloudinary.uploader.upload(fileUrl, {
      folder,
      resource_type: "image",
    });

    res.status(201).json({
      success: true,
      data: {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/image", protect, upload.single("file"), async (req, res) => {
  try {
    const uploadedFile = (req as any).file;

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "Image file is required" });
    }

    const folderParam =
      path.basename(uploadedFile.destination || "general").replace(/[^a-zA-Z0-9_-]/g, "") || "general";
    const baseUrl = process.env.API_BASE_URL || process.env.SERVER_URL || "http://localhost:5000";
    const normalizedBase = baseUrl.replace(/\/$/, "");
    const fileUrl = `${normalizedBase}/uploads/${folderParam || "general"}/${uploadedFile.filename}`;

    res.status(201).json({
      success: true,
      data: {
        secureUrl: fileUrl,
        localPath: uploadedFile.path,
        filename: uploadedFile.filename,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/media", protect, mediaUpload.single("file"), async (req, res) => {
  try {
    const uploadedFile = (req as any).file;

    if (!uploadedFile) {
      return res.status(400).json({ success: false, message: "Media file is required" });
    }

    const folderParam =
      path.basename(uploadedFile.destination || "general").replace(/[^a-zA-Z0-9_-]/g, "") || "general";
    const baseUrl = process.env.API_BASE_URL || process.env.SERVER_URL || "http://localhost:5000";
    const normalizedBase = baseUrl.replace(/\/$/, "");
    const fileUrl = `${normalizedBase}/uploads/${folderParam}/${uploadedFile.filename}`;
    const mediaType = String(uploadedFile.mimetype || "").startsWith("video/") ? "video" : "image";

    res.status(201).json({
      success: true,
      data: {
        secureUrl: fileUrl,
        localPath: uploadedFile.path,
        filename: uploadedFile.filename,
        mediaType,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
