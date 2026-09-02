const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FpoGroup = sequelize.define('FpoGroup', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    registration_no: { type: DataTypes.STRING, unique: true, allowNull: true },
    admin_farmer_id: { type: DataTypes.INTEGER, allowNull: false },
    district: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    member_count: { type: DataTypes.INTEGER, defaultValue: 1 },
    commodities: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: ['Onion', 'Tomato', 'Wheat'] },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'fpo_groups',
    timestamps: false
  });

  FpoGroup.associate = (models) => {
    FpoGroup.belongsTo(models.User, { foreignKey: 'admin_farmer_id', as: 'admin' });
  };

  return FpoGroup;
};
