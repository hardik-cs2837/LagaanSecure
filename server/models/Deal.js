const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Deal = sequelize.define('Deal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    listing_id: { type: DataTypes.INTEGER, allowNull: false },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false },
    offered_price: { type: DataTypes.FLOAT, allowNull: false },
    counter_price: { type: DataTypes.FLOAT },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'countered'), defaultValue: 'pending' },
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
};\n