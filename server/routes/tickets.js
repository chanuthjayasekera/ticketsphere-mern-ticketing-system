const router = require('express').Router();
const path = require('path');
const multer = require('multer');

const Ticket = require('../models/ticket.model');
const User = require('../models/user.model');
const { authRequired, requireRole } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '..', 'uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

// Helpers
function mapAttachments(req) {
  const files = req.files || [];
  return files.map((f) => ({
    originalName: f.originalname,
    fileName: f.filename,
    mimeType: f.mimetype,
    size: f.size,
    url: `/uploads/${f.filename}`,
  }));
}

// USER: create ticket
router.post(
  '/',
  authRequired,
  requireRole('user'),
  upload.array('attachments', 6),
  async (req, res) => {
    try {
      const { title, description, category, priority, contactEmail, contactPhone } =
        req.body || {};
      if (!title || !description || !category || !contactEmail) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const attachments = mapAttachments(req);

      const ticket = await Ticket.create({
        title,
        description,
        category,
        priority: priority || 'Medium',
        contactEmail,
        contactPhone: contactPhone || '',
        createdBy: req.user.id,
        attachments,
        messages: [
          { senderRole: 'user', senderId: req.user.id, message: 'Ticket created.' },
        ],
      });

      return res.json(ticket);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// USER: list own tickets
router.get('/mine', authRequired, requireRole('user'), async (req, res) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    return res.json(tickets);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// USER: get one own ticket
router.get('/mine/:id', authRequired, requireRole('user'), async (req, res) => {
  try {
    const t = await Ticket.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('messages.senderId', 'name email role');

    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    return res.json(t);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// USER: edit own ticket (only if not resolved)
router.put(
  '/mine/:id',
  authRequired,
  requireRole('user'),
  upload.array('attachments', 6),
  async (req, res) => {
    try {
      const t = await Ticket.findOne({ _id: req.params.id, createdBy: req.user.id });
      if (!t) return res.status(404).json({ message: 'Ticket not found' });
      if (t.status === 'Resolved')
        return res.status(400).json({ message: 'Resolved tickets cannot be edited' });

      const { title, description, category, priority, contactEmail, contactPhone } =
        req.body || {};
      if (title) t.title = title;
      if (description) t.description = description;
      if (category) t.category = category;
      if (priority) t.priority = priority;
      if (contactEmail) t.contactEmail = contactEmail;
      if (contactPhone !== undefined) t.contactPhone = contactPhone;

      const newAttachments = mapAttachments(req);
      if (newAttachments.length) t.attachments = [...t.attachments, ...newAttachments];

      t.messages.push({
        senderRole: 'user',
        senderId: req.user.id,
        message: 'Ticket updated.',
      });

      await t.save();
      return res.json(t);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// ✅ USER: add message to own ticket (supports attachments)
router.post(
  '/mine/:id/messages',
  authRequired,
  requireRole('user'),
  upload.array('attachments', 6),
  async (req, res) => {
    try {
      let { message } = req.body || {};
      const attachments = mapAttachments(req);

      if ((!message || !message.trim()) && attachments.length) {
        message = 'Files attached';
      }

      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const t = await Ticket.findOne({ _id: req.params.id, createdBy: req.user.id });
      if (!t) return res.status(404).json({ message: 'Ticket not found' });

      t.messages.push({
        senderRole: 'user',
        senderId: req.user.id,
        message: message.trim(),
        attachments,
      });

      await t.save();
      return res.json(t);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

//
// ✅ CLOSE TICKET (replaces delete)
// PATCH /tickets/:id/close
//
router.patch('/:id/close', authRequired, requireRole('user'), async (req, res) => {
  try {
    const t = await Ticket.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!t) return res.status(404).json({ message: 'Ticket not found' });

    if (t.status === 'Resolved') {
      return res.status(400).json({ message: 'Ticket is already resolved' });
    }

    t.status = 'Resolved';
    t.messages.push({
      senderRole: 'user',
      senderId: req.user.id,
      message: 'Ticket closed by user.',
    });

    await t.save();
    return res.json(t);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: list all tickets
router.get('/', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');
    return res.json(tickets);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: get any ticket
router.get('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const t = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('messages.senderId', 'name email role');

    if (!t) return res.status(404).json({ message: 'Ticket not found' });
    return res.json(t);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN: update status/assign/resolution
router.put('/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { status, assignedTo, resolutionSummary, priority } = req.body || {};
    const t = await Ticket.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Ticket not found' });

    if (status) t.status = status;
    if (priority) t.priority = priority;

    if (assignedTo) {
      const admin = await User.findOne({ _id: assignedTo, role: 'admin' });
      if (!admin) return res.status(400).json({ message: 'assignedTo must be an admin user id' });
      t.assignedTo = admin._id;
    }

    if (resolutionSummary !== undefined) t.resolutionSummary = resolutionSummary;

    t.messages.push({
      senderRole: 'admin',
      senderId: req.user.id,
      message: 'Ticket updated by admin.',
    });

    await t.save();
    return res.json(t);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ ADMIN: add response message (supports attachments)
router.post(
  '/:id/messages',
  authRequired,
  requireRole('admin'),
  upload.array('attachments', 6),
  async (req, res) => {
    try {
      let { message } = req.body || {};
      const attachments = mapAttachments(req);

      if ((!message || !message.trim()) && attachments.length) {
        message = 'Files attached';
      }

      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message is required' });
      }

      const t = await Ticket.findById(req.params.id);
      if (!t) return res.status(404).json({ message: 'Ticket not found' });

      t.messages.push({
        senderRole: 'admin',
        senderId: req.user.id,
        message: message.trim(),
        attachments,
      });

      await t.save();
      return res.json(t);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
