const path = require("path");
const Ticket = require("../models/Ticket");

// 1. CREATE TICKET (With Attachments)
const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, relatedUrl, message } = req.body;
    
    // 📸 Server ka base URL nikalein (e.g., http://localhost:5000)
    const serverUrl = process.env.SERVER_URL || `${req.protocol}://${req.get('host')}`;
    
    // 📁 Files array process karein agar user ne attachments bheji hain
    let attachedFilesUrls = [];
    if (req.files && req.files.length > 0) {
      attachedFilesUrls = req.files.map(file => {
        return `${serverUrl}/api/uploads/${path.basename(file.filename)}`;
      });
    }

    const ticket = await Ticket.create({
      userId: req.user.id,
      subject,
      category,
      priority,
      relatedUrl,
      // Agar main ticket level par attachments save karni hon to (Safar asan karne ke liye)
      attachments: attachedFilesUrls, 
      messages: [
        {
          sender: req.user.role,
          senderId: req.user.id,
          senderName: req.user.fullName,
          message,
          attachments: attachedFilesUrls // Pehle message ke andar files map kar di
        },
      ],
    });

    res.status(201).json({
      success: true,
      ticket,
    });
  } catch (err) {
    console.error("❌ Create Ticket Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. GET ALL TICKETS
const getTickets = async (req, res) => {
  try {
    // Agar normal user hai to sirf uske tickets, agar admin hai to saare tickets
    // Aapki purani logic ko secure karne ke liye check laga sakti hain
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. GET TICKET BY ID
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // 🌟 Yahan senderName ko add karein
    ticket.messages.push({
      sender: req.user.role,
      senderId: req.user.id,
      senderName: req.user.fullName, // 👈 Yeh missing tha, ise add karein
      message,
    });

    if (req.user.role === "admin") {
      ticket.status = "pending";
    } else {
      ticket.status = "open";
    }

    await ticket.save();
    res.status(200).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createTicket, getTickets, addMessage, getTicketById };