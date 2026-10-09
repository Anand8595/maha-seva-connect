import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    marathiTitle: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      default: 'नवीन', // उदा. 'नवीन', 'ऑफर', 'महत्त्वाचे'
    },
    tagColor: {
      type: String,
      default: 'orange', // 'orange' | 'green' | 'blue'
    },
    contentMarathi: {
      type: String,
      required: true,
    },
    contentEnglish: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeSchema);
export default Notice;
