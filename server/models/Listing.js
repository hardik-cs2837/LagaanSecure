const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Listing = sequelize.define('Listing', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    farmer_id: { type: DataTypes.INTEGER, allowNull: false },
    crop_name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.FLOAT, allowNull: false },
    unit: { type: DataTypes.STRING, defaultValue: 'quintal' },
    price_per_unit: { type: DataTypes.FLOAT, allowNull: true },
    quality_grade: { type: DataTypes.ENUM('A', 'B', 'C'), defaultValue: 'B' },
    quality_checklist: { type: DataTypes.JSON, allowNull: true },
    photo_url: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING },
    latitude: { type: DataTypes.FLOAT, allowNull: true },
    longitude: { type: DataTypes.FLOAT, allowNull: true },
    is_fpo_pool: { type: DataTypes.BOOLEAN, defaultValue: false },
    fpo_name: { type: DataTypes.STRING, allowNull: true },
    fpo_member_splits: { type: DataTypes.JSON, allowNull: true },
    harvest_date: { type: DataTypes.DATEONLY, allowNull: true },
    is_in_storage: { type: DataTypes.BOOLEAN, defaultValue: false },
    storage_facility_name: { type: DataTypes.STRING, allowNull: true },
    storage_deposit_date: { type: DataTypes.DATEONLY, allowNull: true },
    storage_expiry_date: { type: DataTypes.DATEONLY, allowNull: true },
    storage_receipt_no: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'sold'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'listings',
    timestamps: false
  });

  Listing.associate = (models) => {
    Listing.belongsTo(models.User, { foreignKey: 'farmer_id', as: 'farmer' });
    Listing.hasMany(models.Deal, { foreignKey: 'listing_id', as: 'deals' });
  };
  return Listing;
};
