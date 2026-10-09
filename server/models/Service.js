import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    marathiTitle: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'identity', // ओळखपत्र सेवा
        'certificates', // दाखले / प्रमाणपत्र
        'farmer', // शेतकरी सेवा
        'online_govt', // ऑनलाईन शासकीय सेवा
        'csc_partner', // सायबर कॅफे / CSC
      ],
      default: 'identity',
    },
    categoryMarathi: {
      type: String,
      default: 'ओळखपत्र सेवा',
    },
    description: {
      type: String,
      required: true,
    },
    detailedDescription: {
      type: String,
    },
    requiredDocs: [
      {
        name: { type: String, required: true },
        marathiName: { type: String, required: true },
        isMandatory: { type: Boolean, default: true },
        notes: { type: String, default: '' },
      },
    ],
    basePrice: {
      type: Number,
      required: true,
      default: 199,
    },
    agentCommission: {
      type: Number,
      required: true,
      default: 40,
    },
    estimatedDays: {
      type: String,
      required: true,
      default: '७-१५ दिवस',
    },
    iconType: {
      type: String,
      default: 'id-card',
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
