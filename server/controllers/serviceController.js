import Service from '../models/Service.js';
import { memoryStore, getIsMongoConnected } from '../config/db.js';

export const getAllServices = async (req, res) => {
  try {
    const { category, search } = req.query;

    if (getIsMongoConnected()) {
      const query = { active: true };
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { marathiTitle: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
      const services = await Service.find(query).sort({ isPopular: -1, createdAt: 1 });
      return res.json({ success: true, count: services.length, services });
    } else {
      let filtered = [...memoryStore.services].filter((s) => s.active !== false);
      if (category && category !== 'all') {
        filtered = filtered.filter((s) => s.category === category);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.marathiTitle.includes(q) ||
            s.description.toLowerCase().includes(q)
        );
      }
      return res.json({ success: true, count: filtered.length, services: filtered });
    }
  } catch (error) {
    console.error('Get Services Error:', error);
    res.status(500).json({ success: false, message: 'सेवा लोड करताना त्रुटी आली.' });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let service;
    if (getIsMongoConnected()) {
      service = await Service.findOne({ slug });
    } else {
      service = memoryStore.services.find((s) => s.slug === slug);
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'ही सेवा सापडली नाही.' });
    }

    return res.json({ success: true, service });
  } catch (error) {
    console.error('Get Service Detail Error:', error);
    res.status(500).json({ success: false, message: 'माहिती मिळवताना त्रुटी आली.' });
  }
};

export const createService = async (req, res) => {
  try {
    const {
      title,
      marathiTitle,
      slug,
      category,
      categoryMarathi,
      description,
      detailedDescription,
      requiredDocs,
      basePrice,
      agentCommission,
      estimatedDays,
      iconType,
      isPopular,
    } = req.body;

    const newSlug = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (getIsMongoConnected()) {
      const created = await Service.create({
        title,
        marathiTitle,
        slug: newSlug,
        category,
        categoryMarathi,
        description,
        detailedDescription,
        requiredDocs: requiredDocs || [],
        basePrice: Number(basePrice) || 199,
        agentCommission: Number(agentCommission) || 40,
        estimatedDays: estimatedDays || '७-१५ दिवस',
        iconType: iconType || 'file-text',
        isPopular: Boolean(isPopular),
      });
      return res.status(201).json({ success: true, message: 'नवीन सेवा जोडली गेली!', service: created });
    } else {
      const newService = {
        _id: `srv_${Date.now()}`,
        title,
        marathiTitle,
        slug: newSlug,
        category,
        categoryMarathi,
        description,
        detailedDescription,
        requiredDocs: requiredDocs || [],
        basePrice: Number(basePrice) || 199,
        agentCommission: Number(agentCommission) || 40,
        estimatedDays: estimatedDays || '७-१५ दिवस',
        iconType: iconType || 'file-text',
        isPopular: Boolean(isPopular),
        active: true,
        createdAt: new Date(),
      };
      memoryStore.services.push(newService);
      return res.status(201).json({ success: true, message: 'नवीन सेवा जोडली गेली!', service: newService });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getIsMongoConnected()) {
      const updated = await Service.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, message: 'सेवा अद्ययावत केली गेली!', service: updated });
    } else {
      const idx = memoryStore.services.findIndex((s) => String(s._id) === String(id));
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'सेवा सापडली नाही.' });
      }
      memoryStore.services[idx] = { ...memoryStore.services[idx], ...updates, updatedAt: new Date() };
      return res.json({ success: true, message: 'सेवा अद्ययावत केली गेली!', service: memoryStore.services[idx] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
