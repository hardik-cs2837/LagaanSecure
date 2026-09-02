const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deal = sequelize.define('Deal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    listing_id: { type: DataTypes.INTEGER, allowNull: false },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false },
    offered_price: { type: DataTypes.FLOAT, allowNull: false },
    counter_price: { type: DataTypes.FLOAT },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered'), defaultValue: 'pending' },
    payment_status: { 
      type: DataTypes.ENUM('unpaid', 'pending_confirmation', 'paid', 'refunded'), 
      defaultValue: 'unpaid' 
    },
    payment_method: { type: DataTypes.STRING, defaultValue: 'bank_transfer' },
    payment_reference: { type: DataTypes.STRING, allowNull: true },
    dispute_status: { 
      type: DataTypes.ENUM('none', 'open', 'under_review', 'resolved'), 
      defaultValue: 'none' 
    },
    dispute_reason: { type: DataTypes.TEXT, allowNull: true },
    dispute_resolution: { type: DataTypes.TEXT, allowNull: true },
    transport_requested: { type: DataTypes.BOOLEAN, defaultValue: false },
    transport_details: { type: DataTypes.JSON, allowNull: true },
    farmer_rating: { type: DataTypes.INTEGER, allowNull: true },
    farmer_feedback: { type: DataTypes.TEXT, allowNull: true },
    buyer_rating: { type: DataTypes.INTEGER, allowNull: true },
    buyer_feedback: { type: DataTypes.TEXT, allowNull: true },
    fpo_payout_splits: { type: DataTypes.JSON, allowNull: true },
    audit_timeline: { type: DataTypes.JSON, defaultValue: [] },
  }, {
    tableName: 'deals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Deal.associate = (models) => {
    Deal.belongsTo(models.Listing, { foreignKey: 'listing_id', as: 'listing' });
    Deal.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' });
  };
  return Deal;
};
