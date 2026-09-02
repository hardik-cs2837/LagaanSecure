const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BulkRequirement = sequelize.define('BulkRequirement', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false },
    buyer_name: { type: DataTypes.STRING, allowNull: false },
    business_type: { 
      type: DataTypes.ENUM('supermarket', 'processor', 'restaurant_chain', 'hotel_group', 'exporter', 'wholesaler'),
      defaultValue: 'supermarket'
    },
    crop_name: { type: DataTypes.STRING, allowNull: false },
    quantity_quintals: { type: DataTypes.FLOAT, allowNull: false },
    target_price_min: { type: DataTypes.FLOAT, allowNull: false },
    target_price_max: { type: DataTypes.FLOAT, allowNull: false },
    quality_grade: { type: DataTypes.ENUM('A', 'B', 'C', 'ANY'), defaultValue: 'A' },
    delivery_location: { type: DataTypes.STRING, allowNull: false },
    required_by_date: { type: DataTypes.DATEONLY, allowNull: false },
    status: { type: DataTypes.ENUM('open', 'matched', 'fulfilled', 'cancelled'), defaultValue: 'open' },
    additional_specs: { type: DataTypes.TEXT, allowNull: true },
    matched_farmer_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'bulk_requirements',
    timestamps: false
  });

  BulkRequirement.associate = (models) => {
    BulkRequirement.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' });
  };

  return BulkRequirement;
};
