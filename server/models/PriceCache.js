const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriceCache = sequelize.define('PriceCache', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    commodity: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    market: { type: DataTypes.STRING, allowNull: false },
    min_price: { type: DataTypes.FLOAT },
    max_price: { type: DataTypes.FLOAT },
    modal_price: { type: DataTypes.FLOAT },
    date: { type: DataTypes.DATEONLY },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'price_cache',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['commodity', 'state', 'market', 'date']
      }
    ]
  });
  return PriceCache;
};
