import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceDetails: {
      title: String,
      marathiTitle: String,
      slug: String,
      basePrice: Number,
      agentCommission: Number,
    },
    applicantDetails: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      aadhaarOrId: { type: String, default: '' },
      district: { type: String, default: '' },
      taluka: { type: String, default: '' },
      village: { type: String, default: '' },
      pincode: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    uploadedDocs: [
      {
        docType: { type: String, default: 'Document' },
        name: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['valid', 'rejected', 'pending'], default: 'valid' },
        rejectionReason: { type: String, default: '' },
      },
    ],
    // 1: अर्ज प्राप्त (Received), 2: तपासणी (Verification), 3: कागदपत्रे (Doc Review), 4: प्रक्रियेत (In Process), 5: पूर्ण (Completed)
    currentStage: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    status: {
      type: String,
      enum: ['submitted', 'in_review', 'action_needed', 'completed', 'rejected'],
      default: 'submitted',
    },
    statusNoteMarathi: {
      type: String,
      default: 'तुमचा अर्ज यशस्वीरीत्या प्राप्त झाला आहे.',
    },
    actionRequiredNote: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'waived'],
      default: 'paid',
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    referralCodeUsed: {
      type: String,
      trim: true,
      default: '',
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timeline: [
      {
        stage: Number,
        titleMarathi: String,
        descriptionMarathi: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Helper function to generate custom YD-XXXXX ID
applicationSchema.statics.generateApplicationNumber = function () {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `YD-${randomNum}`;
};

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;
