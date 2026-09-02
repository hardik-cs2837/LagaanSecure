const { sequelize } = require('../config/database');

const db = {
  User: require('./User')(sequelize),
  Listing: require('./Listing')(sequelize),
  Deal: require('./Deal')(sequelize),
  FpoGroup: require('./FpoGroup')(sequelize),
  Notification: require('./Notification')(sequelize),
  PriceCache: require('./PriceCache')(sequelize),
  BulkRequirement: require('./BulkRequirement')(sequelize),
  OtpStore: require('./OtpStore')(sequelize),
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
