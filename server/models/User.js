const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('farmer', 'buyer', 'admin'), allowNull: false },
    phone: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: true },
    location: { type: DataTypes.STRING },
    language_pref: { type: DataTypes.STRING, defaultValue: 'en' },
    business_name: { type: DataTypes.STRING, allowNull: true },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    fpo_name: { type: DataTypes.STRING, allowNull: true },
    rating_avg: { type: DataTypes.FLOAT, defaultValue: 4.8 },
    rating_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    deals_completed_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    payment_reliability_rate: { type: DataTypes.FLOAT, defaultValue: 100.0 },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'users',
    timestamps: false
  });

  User.associate = (models) => {
    User.hasMany(models.Listing, { foreignKey: 'farmer_id', as: 'listings' });
    User.hasMany(models.Deal, { foreignKey: 'buyer_id', as: 'deals' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
  };
  return User;
};
