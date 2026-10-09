import Notice from '../models/Notice.js';
import { memoryStore, getIsMongoConnected } from '../config/db.js';

export const getNotices = async (req, res) => {
  try {
    if (getIsMongoConnected()) {
      const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
      return res.json({ success: true, count: notices.length, notices });
    } else {
      const notices = memoryStore.notices.filter((n) => n.isActive !== false);
      return res.json({ success: true, count: notices.length, notices });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createNotice = async (req, res) => {
  try {
    const { title, marathiTitle, tag, tagColor, contentMarathi, contentEnglish, link } = req.body;

    if (!title || !marathiTitle || !contentMarathi) {
      return res.status(400).json({ success: false, message: 'शीर्षक आणि मजकूर आवश्यक आहे.' });
    }

    if (getIsMongoConnected()) {
      const notice = await Notice.create({
        title,
        marathiTitle,
        tag: tag || 'नवीन',
        tagColor: tagColor || 'orange',
        contentMarathi,
        contentEnglish: contentEnglish || '',
        link: link || '',
      });
      return res.status(201).json({ success: true, notice });
    } else {
      const notice = {
        _id: `notice_${Date.now()}`,
        title,
        marathiTitle,
        tag: tag || 'नवीन',
        tagColor: tagColor || 'orange',
        contentMarathi,
        contentEnglish: contentEnglish || '',
        link: link || '',
        isActive: true,
        createdAt: new Date(),
      };
      memoryStore.notices.unshift(notice);
      return res.status(201).json({ success: true, notice });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
