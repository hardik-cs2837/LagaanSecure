const { Notification } = require('../models');

const createNotification = async (userId, message, type = 'deal_update', referenceId = null) => {
  return await Notification.create({
    user_id: userId,
    message,
    type,
    reference_id: referenceId
  });
};

const getUserNotifications = async (userId) => {
  return await Notification.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']]
  });
};

const markAsRead = async (notificationId) => {
  return await Notification.update(
    { read: true },
    { where: { id: notificationId } }
  );
};

const markAllAsRead = async (userId) => {
  return await Notification.update(
    { read: true },
    { where: { user_id: userId } }
  );
};

const notifyDealUpdate = async (deal, listing) => {
  if (deal.status === 'accepted') {
    await createNotification(deal.buyer_id, `Your deal for ${listing.crop_name} was accepted!`, 'deal_update', deal.id);
    await createNotification(listing.farmer_id, `You accepted a deal for ${listing.crop_name}.`, 'deal_update', deal.id);
  } else if (deal.status === 'countered') {
    await createNotification(deal.buyer_id, `Farmer countered your offer for ${listing.crop_name}.`, 'deal_update', deal.id);
  } else if (deal.status === 'rejected') {
    await createNotification(deal.buyer_id, `Your deal for ${listing.crop_name} was rejected.`, 'deal_update', deal.id);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  notifyDealUpdate
};
