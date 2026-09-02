// TODO: Wire up Twilio when ready

const sendSMS = async (phone, message) => {
  console.log(`SMS stub: would send to ${phone}: ${message}`);
  return true;
};

const sendWhatsApp = async (phone, message) => {
  console.log(`WhatsApp stub: would send to ${phone}: ${message}`);
  return true;
};

module.exports = { sendSMS, sendWhatsApp };
