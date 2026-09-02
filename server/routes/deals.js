const express = require('express');
const { Deal, Listing, User } = require('../models');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, dealValidation } = require('../middleware/validate');
const notificationService = require('../services/notificationService');
const { Op } = require('sequelize');

const router = express.Router();

router.post('/', verifyToken, requireRole('buyer'), dealValidation, validate, async (req, res, next) => {
  try {
    const { listing_id, offered_price } = req.body;
    const listing = await Listing.findByPk(listing_id, {
      include: [{ model: User, as: 'farmer' }]
    });
    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });
    
    const initialTimeline = [
      {
        event: 'OFFER_SUBMITTED',
        actor: 'buyer',
        title: 'Offer Submitted',
        description: `Buyer submitted a direct offer of ₹${offered_price}/${listing.unit || 'quintal'}`,
        timestamp: new Date().toISOString()
      }
    ];

    const deal = await Deal.create({ 
      listing_id, 
      buyer_id: req.user.id, 
      offered_price,
      audit_timeline: initialTimeline
    });

    await notificationService.createNotification(
      listing.farmer_id, 
      `New direct purchase offer of ₹${offered_price} for your ${listing.crop_name} (${listing.quantity} ${listing.unit})`, 
      'deal_update', 
      deal.id
    );
    
    res.status(201).json({ success: true, data: deal });
  } catch (err) { next(err); }
});

router.get('/my', verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const deals = await Deal.findAll({
      include: [
        { 
          model: Listing, 
          as: 'listing', 
          where: req.user.role === 'farmer' ? { farmer_id: userId } : {},
          include: [{ 
            model: User, 
            as: 'farmer', 
            attributes: ['id', 'name', 'phone', 'location', 'business_name', 'is_verified', 'fpo_name', 'rating_avg', 'deals_completed_count'] 
          }]
        },
        { 
          model: User, 
          as: 'buyer', 
          attributes: ['id', 'name', 'phone', 'location', 'business_name', 'is_verified', 'rating_avg', 'deals_completed_count', 'payment_reliability_rate'] 
        }
      ],
      where: req.user.role === 'buyer' ? { buyer_id: userId } : {},
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: deals });
  } catch (err) { next(err); }
});

// Update deal & append to audit timeline
router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    const { 
      status, 
      counter_price, 
      payment_status, 
      payment_method, 
      payment_reference,
      dispute_status,
      dispute_reason,
      dispute_resolution,
      transport_requested,
      transport_details
    } = req.body;
    
    const deal = await Deal.findByPk(req.params.id, { 
      include: [
        { model: Listing, as: 'listing' },
        { model: User, as: 'buyer', attributes: ['id', 'name', 'rating_avg', 'deals_completed_count'] }
      ] 
    });
    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });
    
    const isBuyer = deal.buyer_id === req.user.id;
    const isFarmer = deal.listing.farmer_id === req.user.id;
    if (!isBuyer && !isFarmer) return res.status(403).json({ success: false, error: 'Unauthorized' });
    
    const updates = {};
    const timeline = Array.isArray(deal.audit_timeline) ? [...deal.audit_timeline] : [];
    const now = new Date().toISOString();

    let transaction = null;

    if (status) {
      updates.status = status;
      if (status === 'accepted') {
        // Prevent race conditions and overselling by using a transaction
        const { sequelize } = require('../models');
        transaction = await sequelize.transaction();

        const currentListing = await Listing.findByPk(deal.listing_id, { transaction, lock: transaction.LOCK.UPDATE });
        if (currentListing.status !== 'active') {
          await transaction.rollback();
          return res.status(400).json({ success: false, error: 'Listing is no longer active' });
        }

        await currentListing.update({ status: 'sold' }, { transaction });

        timeline.push({
          event: 'DEAL_ACCEPTED',
          actor: isFarmer ? 'farmer' : 'buyer',
          title: 'Deal Accepted & Confirmed',
          description: `Direct agreement locked at ₹${deal.counter_price || deal.offered_price}/${deal.listing.unit}. Zero commission intermediaries.`,
          timestamp: now
        });

        // Compute FPO member proportional payouts if this was an FPO bulk lot
        if (deal.listing.is_fpo_pool && Array.isArray(deal.listing.fpo_member_splits)) {
          const finalPrice = deal.counter_price || deal.offered_price;
          const totalDealValue = finalPrice * (deal.listing.quantity || 1);
          const fpoPayouts = deal.listing.fpo_member_splits.map(member => {
            const memberTotalPayout = Math.round((member.share_percent / 100) * totalDealValue);
            return {
              ...member,
              effective_rate_per_qtl: finalPrice,
              total_payout_inr: memberTotalPayout
            };
          });
          updates.fpo_payout_splits = fpoPayouts;
        }
      } else if (status === 'countered') {
        timeline.push({
          event: 'COUNTER_OFFER',
          actor: isFarmer ? 'farmer' : 'buyer',
          title: 'Counter Offer Proposed',
          description: `Counter offer sent of ₹${counter_price}/${deal.listing.unit}`,
          timestamp: now
        });
      } else if (status === 'rejected') {
        timeline.push({
          event: 'DEAL_REJECTED',
          actor: isFarmer ? 'farmer' : 'buyer',
          title: 'Offer Declined',
          description: 'Offer was declined by party.',
          timestamp: now
        });
      }
    }

    if (counter_price !== undefined) updates.counter_price = counter_price;

    if (payment_status) {
      updates.payment_status = payment_status;
      if (payment_status === 'pending_confirmation') {
        timeline.push({
          event: 'PAYMENT_SUBMITTED',
          actor: 'buyer',
          title: 'Payment Details Submitted',
          description: `Payment marked via ${payment_method || 'Bank Transfer'}${payment_reference ? ` (Ref: ${payment_reference})` : ''}`,
          timestamp: now
        });
      } else if (payment_status === 'paid') {
        timeline.push({
          event: 'PAYMENT_CONFIRMED',
          actor: 'farmer',
          title: 'Payment Confirmed & Settled',
          description: 'Farmer confirmed receipt of full trade settlement.',
          timestamp: now
        });
      }
    }

    if (payment_method) updates.payment_method = payment_method;
    if (payment_reference !== undefined) updates.payment_reference = payment_reference;

    if (dispute_status) {
      updates.dispute_status = dispute_status;
      if (dispute_status === 'open') {
        timeline.push({
          event: 'DISPUTE_OPENED',
          actor: isFarmer ? 'farmer' : 'buyer',
          title: 'Grievance / Dispute Filed',
          description: `Grievance raised: "${dispute_reason}"`,
          timestamp: now
        });
      } else if (dispute_status === 'resolved') {
        timeline.push({
          event: 'DISPUTE_RESOLVED',
          actor: isFarmer ? 'farmer' : 'buyer',
          title: 'Grievance Resolved',
          description: `Resolved: "${dispute_resolution || 'Resolved amicably between parties.'}"`,
          timestamp: now
        });
      }
    }

    if (dispute_reason !== undefined) updates.dispute_reason = dispute_reason;
    if (dispute_resolution !== undefined) updates.dispute_resolution = dispute_resolution;

    if (transport_requested !== undefined) {
      updates.transport_requested = transport_requested;
      if (transport_requested) {
        timeline.push({
          event: 'LOGISTICS_BOOKED',
          actor: isBuyer ? 'buyer' : 'farmer',
          title: 'Haulage & Logistics Requested',
          description: `Transport booked: ${transport_details?.provider_name || 'Kisaan Express'} (${transport_details?.vehicle_type || 'Mini Truck'})`,
          timestamp: now
        });
      }
    }
    if (transport_details !== undefined) updates.transport_details = transport_details;

    updates.audit_timeline = timeline;
    await deal.update(updates, { transaction });
    if (transaction) await transaction.commit();
    
    // Send notifications for key milestones
    if (status) {
      await notificationService.notifyDealUpdate(deal, deal.listing);
    }
    if (payment_status === 'paid' || payment_status === 'pending_confirmation') {
      const recipientId = isBuyer ? deal.listing.farmer_id : deal.buyer_id;
      await notificationService.createNotification(
        recipientId,
        `Payment status for ${deal.listing.crop_name} deal updated to "${payment_status.replace('_', ' ').toUpperCase()}".`,
        'payment_update',
        deal.id
      );
    }
    if (dispute_status === 'open') {
      const recipientId = isBuyer ? deal.listing.farmer_id : deal.buyer_id;
      await notificationService.createNotification(
        recipientId,
        `A grievance was opened for ${deal.listing.crop_name} deal: "${dispute_reason || 'Under review'}"`,
        'dispute_update',
        deal.id
      );
    }
    if (transport_requested) {
      await notificationService.createNotification(
        deal.listing.farmer_id,
        `Transport was requested for ${deal.listing.crop_name} (${transport_details?.provider_name || 'Logistics Partner'}).`,
        'transport_update',
        deal.id
      );
    }
    
    res.json({ success: true, data: deal });
  } catch (err) { next(err); }
});

// Star Rating & Feedback (Section F: Trust Signals)
router.post('/:id/rate', verifyToken, async (req, res, next) => {
  try {
    const { rating, feedback } = req.body;
    const deal = await Deal.findByPk(req.params.id, {
      include: [{ model: Listing, as: 'listing' }]
    });
    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });

    const isBuyer = deal.buyer_id === req.user.id;
    const isFarmer = deal.listing.farmer_id === req.user.id;
    if (!isBuyer && !isFarmer) return res.status(403).json({ success: false, error: 'Unauthorized' });

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const targetUserId = isBuyer ? deal.listing.farmer_id : deal.buyer_id;
    const targetUser = await User.findByPk(targetUserId);

    if (isFarmer) {
      await deal.update({ farmer_rating: numRating, farmer_feedback: feedback || null });
    } else {
      await deal.update({ buyer_rating: numRating, buyer_feedback: feedback || null });
    }

    if (targetUser) {
      const newCount = (targetUser.rating_count || 0) + 1;
      const currentAvg = targetUser.rating_avg || 4.8;
      const newAvg = Number(((currentAvg * (newCount - 1) + numRating) / newCount).toFixed(1));
      const completedDeals = (targetUser.deals_completed_count || 0) + 1;

      await targetUser.update({
        rating_avg: newAvg,
        rating_count: newCount,
        deals_completed_count: completedDeals
      });
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully! Trust score updated.',
      data: { rating: numRating, targetUserId }
    });
  } catch (err) { next(err); }
});

// Printable Receipt / Tax Invoice Data Generator (Section G)
router.get('/:id/receipt', verifyToken, async (req, res, next) => {
  try {
    const deal = await Deal.findByPk(req.params.id, {
      include: [
        { 
          model: Listing, 
          as: 'listing',
          include: [{ model: User, as: 'farmer' }]
        },
        { model: User, as: 'buyer' }
      ]
    });
    if (!deal) return res.status(404).json({ success: false, error: 'Deal not found' });

    const effectiveRate = deal.counter_price || deal.offered_price;
    const quantity = deal.listing.quantity;
    const subtotal = Math.round(effectiveRate * quantity);
    const platformFee = 0; // zero intermediary commission!
    const mandiCess = 0; // zero middleman cess
    const totalAmount = subtotal;

    const invoiceData = {
      invoiceNumber: `KC-INV-${deal.id.toString().padStart(6, '0')}`,
      dealId: deal.id,
      date: deal.created_at,
      settlementDate: deal.updated_at,
      status: deal.status,
      paymentStatus: deal.payment_status,
      paymentMethod: deal.payment_method,
      paymentRef: deal.payment_reference,
      seller: {
        name: deal.listing.farmer?.name || 'Farmer',
        role: 'Direct Agricultural Producer',
        fpo: deal.listing.fpo_name || 'Individual Farm Owner',
        location: deal.listing.location,
        phone: deal.listing.farmer?.phone
      },
      buyer: {
        name: deal.buyer?.name || 'Buyer',
        businessName: deal.buyer?.business_name || 'Direct Wholesale Buyer',
        location: deal.buyer?.location,
        verified: deal.buyer?.is_verified
      },
      produce: {
        crop: deal.listing.crop_name,
        quantity: quantity,
        unit: deal.listing.unit,
        qualityGrade: deal.listing.quality_grade,
        ratePerUnit: effectiveRate,
        isFpoPool: deal.listing.is_fpo_pool,
        harvestDate: deal.listing.harvest_date
      },
      fpoMemberSplits: deal.fpo_payout_splits || deal.listing.fpo_member_splits || null,
      financials: {
        subtotalInr: subtotal,
        intermediaryCommissionSavedInr: Math.round(subtotal * 0.15),
        platformFeeInr: platformFee,
        totalPayableInr: totalAmount
      },
      transport: deal.transport_details || null,
      authenticityHash: `SHA256-${deal.id}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    res.json({ success: true, data: invoiceData });
  } catch (err) { next(err); }
});

module.exports = router;
