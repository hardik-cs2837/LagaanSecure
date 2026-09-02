'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('farmer', 'buyer'), allowNull: false },
      phone: { type: Sequelize.STRING, unique: true, allowNull: false },
      email: { type: Sequelize.STRING, unique: true, allowNull: true },
      location: { type: Sequelize.STRING },
      language_pref: { type: Sequelize.STRING, defaultValue: 'en' },
      business_name: { type: Sequelize.STRING, allowNull: true },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      fpo_name: { type: Sequelize.STRING, allowNull: true },
      rating_avg: { type: Sequelize.FLOAT, defaultValue: 4.8 },
      rating_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      deals_completed_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      payment_reliability_rate: { type: Sequelize.FLOAT, defaultValue: 100.0 },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('listings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      farmer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      crop_name: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.FLOAT, allowNull: false },
      unit: { type: Sequelize.STRING, defaultValue: 'quintal' },
      price_per_unit: { type: Sequelize.FLOAT, allowNull: true },
      quality_grade: { type: Sequelize.ENUM('A', 'B', 'C'), defaultValue: 'B' },
      quality_checklist: { type: Sequelize.JSON, allowNull: true },
      photo_url: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      latitude: { type: Sequelize.FLOAT, allowNull: true },
      longitude: { type: Sequelize.FLOAT, allowNull: true },
      is_fpo_pool: { type: Sequelize.BOOLEAN, defaultValue: false },
      fpo_name: { type: Sequelize.STRING, allowNull: true },
      fpo_member_splits: { type: Sequelize.JSON, allowNull: true },
      harvest_date: { type: Sequelize.DATEONLY, allowNull: true },
      is_in_storage: { type: Sequelize.BOOLEAN, defaultValue: false },
      storage_facility_name: { type: Sequelize.STRING, allowNull: true },
      storage_deposit_date: { type: Sequelize.DATEONLY, allowNull: true },
      storage_expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
      storage_receipt_no: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('active', 'sold'), defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('deals', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      listing_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'listings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      buyer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      offered_price: { type: Sequelize.FLOAT, allowNull: false },
      counter_price: { type: Sequelize.FLOAT },
      status: { type: Sequelize.ENUM('pending', 'accepted', 'rejected', 'countered'), defaultValue: 'pending' },
      payment_status: {
        type: Sequelize.ENUM('unpaid', 'pending_confirmation', 'paid', 'refunded'),
        defaultValue: 'unpaid'
      },
      payment_method: { type: Sequelize.STRING, defaultValue: 'bank_transfer' },
      payment_reference: { type: Sequelize.STRING, allowNull: true },
      dispute_status: {
        type: Sequelize.ENUM('none', 'open', 'under_review', 'resolved'),
        defaultValue: 'none'
      },
      dispute_reason: { type: Sequelize.TEXT, allowNull: true },
      dispute_resolution: { type: Sequelize.TEXT, allowNull: true },
      transport_requested: { type: Sequelize.BOOLEAN, defaultValue: false },
      transport_details: { type: Sequelize.JSON, allowNull: true },
      farmer_rating: { type: Sequelize.INTEGER, allowNull: true },
      farmer_feedback: { type: Sequelize.TEXT, allowNull: true },
      buyer_rating: { type: Sequelize.INTEGER, allowNull: true },
      buyer_feedback: { type: Sequelize.TEXT, allowNull: true },
      fpo_payout_splits: { type: Sequelize.JSON, allowNull: true },
      audit_timeline: { type: Sequelize.JSON, defaultValue: [] },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('fpo_groups', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      registration_no: { type: Sequelize.STRING, unique: true, allowNull: true },
      admin_farmer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      district: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: false },
      member_count: { type: Sequelize.INTEGER, defaultValue: 1 },
      commodities: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: ['Onion', 'Tomato', 'Wheat'] },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('price_cache', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      commodity: { type: Sequelize.STRING, allowNull: false },
      state: { type: Sequelize.STRING, allowNull: false },
      market: { type: Sequelize.STRING, allowNull: false },
      min_price: { type: Sequelize.FLOAT },
      max_price: { type: Sequelize.FLOAT },
      modal_price: { type: Sequelize.FLOAT },
      date: { type: Sequelize.DATEONLY },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
    
    await queryInterface.addIndex('price_cache', ['commodity', 'state', 'market', 'date'], { unique: true });

    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      message: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, defaultValue: 'deal_update' },
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      reference_id: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.createTable('bulk_requirements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      buyer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      buyer_name: { type: Sequelize.STRING, allowNull: false },
      business_type: {
        type: Sequelize.ENUM('supermarket', 'processor', 'restaurant_chain', 'hotel_group', 'exporter', 'wholesaler'),
        defaultValue: 'supermarket'
      },
      crop_name: { type: Sequelize.STRING, allowNull: false },
      quantity_quintals: { type: Sequelize.FLOAT, allowNull: false },
      target_price_min: { type: Sequelize.FLOAT, allowNull: false },
      target_price_max: { type: Sequelize.FLOAT, allowNull: false },
      quality_grade: { type: Sequelize.ENUM('A', 'B', 'C', 'ANY'), defaultValue: 'A' },
      delivery_location: { type: Sequelize.STRING, allowNull: false },
      required_by_date: { type: Sequelize.DATEONLY, allowNull: false },
      status: { type: Sequelize.ENUM('open', 'matched', 'fulfilled', 'cancelled'), defaultValue: 'open' },
      additional_specs: { type: Sequelize.TEXT, allowNull: true },
      matched_farmer_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('bulk_requirements');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('price_cache');
    await queryInterface.dropTable('fpo_groups');
    await queryInterface.dropTable('deals');
    await queryInterface.dropTable('listings');
    await queryInterface.dropTable('users');
  }
};
