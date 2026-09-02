const { validationResult, body } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array().map(e => e.msg).join(', ') });
  }
  next();
};

const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('role').isIn(['farmer', 'buyer']).withMessage('Role must be farmer or buyer'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
  body('phone').notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const listingValidation = [
  body('crop_name').notEmpty().withMessage('Crop name is required'),
  body('quantity').isNumeric().withMessage('Quantity must be a number')
];

const dealValidation = [
  body('listing_id').isNumeric().withMessage('Listing ID is required'),
  body('offered_price').isNumeric().withMessage('Offered price is required')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  listingValidation,
  dealValidation
};
