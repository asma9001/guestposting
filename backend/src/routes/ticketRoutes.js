const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
} = require("../controllers/ticketController");

const { protect } = require("../middleware/authMiddleware");

// 📸 Multer middleware import karein (Jo humne ticket uploads ke liye banaya tha)
// Note: Apne folder structure ke mutabiq path check kar lijiyega
const upload = require("../middleware/ticketUpload"); 

// ─── USER & ADMIN ROUTES ──────────────────────────────────────────────────

// 1. Ticket Create Karte Waqt (Maximum 5 files allow hain)
router.post("/create", protect, upload.array("attachments", 5), createTicket);

// 2. Saare Tickets Get Karne Ke Liye
router.get("/", protect, getTickets);

// 3. Kisi Specific Ticket Ki Details Ke Liye
router.get("/:id", protect, getTicketById);

// 4. Chat Mein Reply Bhejte Waqt (Yahan bhi user screenshot bhej sakta hai - Max 5 files)
router.post("/:id/message", protect, upload.array("attachments", 5), addMessage);

module.exports = router;