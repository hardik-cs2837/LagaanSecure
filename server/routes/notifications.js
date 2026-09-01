const express = require('express');
const notificationService = require('../services/notificationService');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    if (parseInt(req.params.userId) !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
});

router.patch('/:id/read', verifyToken, async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id);
    res.json({ success: true, data: { message: 'Marked as read' } });
  } catch (err) { next(err); }
});

router.patch('/read-all', verifyToken, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, data: { message: 'All marked as read' } });
  } catch (err) { next(err); }
});

module.exports = router;\n