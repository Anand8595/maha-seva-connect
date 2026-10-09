import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    applicationNumber: {
      type: String,
      default: '',
    },
    applicantName: {
      type: String,
      default: '',
    },
    serviceTitle: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'withdrawal'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'cleared', 'rejected'],
      default: 'pending',
    },
    descriptionMarathi: {
      type: String,
      default: '',
    },
    payoutDetails: {
      payoutMethod: { type: String, enum: ['upi', 'bank_transfer'], default: 'upi' },
      upiId: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      holderName: { type: String, default: '' },
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WalletTransaction =
  mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
export default WalletTransaction;
