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
    photo_url: { type: DataTypes.STRING },
    location: { type: DataTypes.STRING },
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
};\n