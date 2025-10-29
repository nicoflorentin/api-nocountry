import { Router } from "express";
import { getAllUsers, getUserByID, updateState, updateUserImage } from "../controllers/user";
import { authMiddleware } from "../middleware/auth";
import multer from "multer";

export const user = Router();



const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

user.post("/update_image", authMiddleware, upload.single("file"), updateUserImage);
user.put("/:id", updateState);