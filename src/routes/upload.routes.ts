import { Router } from "express";
import { upload } from "../config/multer";
import { UserRepository } from "../repositories/user.respository";

const router = Router();
const userRepo = new UserRepository();

// POST /api/upload/profile-image/:userId
router.post(
  "/profile-image/:userId",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const userId = req.params.userId;
      const imagePath = `/uploads/${req.file.filename}`;

      // update DB
      const updatedUser = await userRepo.updateUser(userId, {
        profileImage: imagePath,
      });

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: imagePath,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

export default router;
