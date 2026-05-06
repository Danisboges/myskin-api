const detectionService = require('../services/detection.service');

const predict = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ status: "error", message: "User ID is required" });
    }
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }
    const { complaint } = req.body;
    const filePath = req.file.path.replace(/\\/g, "/");
    const userId = req.user.id; 

    const detection = await detectionService.createDetection(userId, filePath, complaint);

    res.status(201).json({ status: "success", data: detection });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

// Ekspor sebagai objek
module.exports = { predict };