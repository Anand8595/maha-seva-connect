import WalletTransaction from '../models/WalletTransaction.js';
import User from '../models/User.js';
import { memoryStore, getIsMongoConnected } from '../config/db.js';

export const getWalletOverview = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'लॉगिन आवश्यक आहे.' });
    }

    const agentId = user._id;

    if (getIsMongoConnected()) {
      const dbUser = await User.findById(agentId);
      const transactions = await WalletTransaction.find({ agentId }).sort({ createdAt: -1 });

      const pendingBalance = transactions
        .filter((t) => t.type === 'credit' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const clearedTotal = transactions
        .filter((t) => t.type === 'credit' && t.status === 'cleared')
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawnTotal = transactions
        .filter((t) => t.type === 'withdrawal' && t.status === 'cleared')
        .reduce((sum, t) => sum + t.amount, 0);

      const availableBalance = dbUser?.walletBalance || 0;

      return res.json({
        success: true,
        data: {
          availableBalance: Math.max(0, availableBalance),
          pendingBalance,
          clearedTotal,
          withdrawnTotal,
          agentName: dbUser?.name || user.name,
          referralCode: dbUser?.referralCode || user.referralCode || (user.phone ? `YD-${user.phone.slice(-4)}` : ''),
          transactions,
        },
      });
    } else {
      const currentUser = memoryStore.users.find(
        (u) => String(u._id) === String(agentId) || (user.phone && u.phone === user.phone)
      ) || user;

      // Filter transactions ONLY for this specific user
      const txs = memoryStore.walletTransactions.filter(
        (t) => String(t.agentId) === String(currentUser._id) || (currentUser.phone && String(t.agentId) === String(currentUser.phone))
      );

      const pendingBalance = txs
        .filter((t) => t.type === 'credit' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const clearedTotal = txs
        .filter((t) => t.type === 'credit' && t.status === 'cleared')
        .reduce((sum, t) => sum + t.amount, 0);

      const withdrawnTotal = txs
        .filter((t) => t.type === 'withdrawal' && t.status === 'cleared')
        .reduce((sum, t) => sum + t.amount, 0);

      const availableBalance = currentUser.walletBalance !== undefined 
        ? currentUser.walletBalance 
        : Math.max(0, clearedTotal - withdrawnTotal);

      return res.json({
        success: true,
        data: {
          availableBalance: Math.max(0, availableBalance),
          pendingBalance: currentUser.pendingBalance !== undefined ? currentUser.pendingBalance : pendingBalance,
          clearedTotal: currentUser.totalEarned !== undefined ? currentUser.totalEarned : clearedTotal,
          withdrawnTotal,
          agentName: currentUser.name || (currentUser.phone ? `नागरिक (${currentUser.phone})` : ''),
          referralCode: currentUser.referralCode || (currentUser.phone ? `YD-${currentUser.phone.slice(-4)}` : ''),
          transactions: txs,
        },
      });
    }
  } catch (error) {
    console.error('Wallet Overview Error:', error);
    res.status(500).json({ success: false, message: 'वॉलेट माहिती लोड करताना त्रुटी आली.' });
  }
};

export const requestWithdrawal = async (req, res) => {
  try {
    const agentId = req.user._id;
    const { amount, payoutMethod = 'upi', upiId, accountNumber, ifscCode, holderName } = req.body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'किमान विड्रॉल रक्कम ₹१०० आहे.',
      });
    }

    if (getIsMongoConnected()) {
      const user = await User.findById(agentId);
      if (!user || (user.walletBalance || 0) < withdrawAmount) {
        return res.status(400).json({
          success: false,
          message: 'खात्यात पुरेशी शिल्लक रक्कम नाही.',
        });
      }

      user.walletBalance -= withdrawAmount;
      await user.save();

      const tx = await WalletTransaction.create({
        agentId: user._id,
        amount: withdrawAmount,
        type: 'withdrawal',
        status: 'pending',
        serviceTitle: payoutMethod === 'upi' ? `UPI विड्रॉल (${upiId})` : `बँक ट्रान्सफर (${accountNumber.slice(-4)})`,
        descriptionMarathi: `${payoutMethod.toUpperCase()} द्वारे पैसे काढण्याची विनंती पाठवली`,
        payoutDetails: {
          payoutMethod,
          upiId: upiId || '',
          accountNumber: accountNumber || '',
          ifscCode: ifscCode || '',
          holderName: holderName || user.name,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'विड्रॉल विनंती यशस्वीरीत्या पाठवली गेली! २४ तासांत रक्कम जमा होईल.',
        transaction: tx,
        newBalance: user.walletBalance,
      });
    } else {
      const user = memoryStore.users.find((u) => String(u._id) === String(agentId)) || memoryStore.users[1];
      if ((user.walletBalance || 0) < withdrawAmount) {
        return res.status(400).json({
          success: false,
          message: 'खात्यात पुरेशी शिल्लक रक्कम नाही.',
        });
      }

      user.walletBalance -= withdrawAmount;

      const newTx = {
        _id: `tx_${Date.now()}`,
        agentId: user._id,
        amount: withdrawAmount,
        type: 'withdrawal',
        status: 'pending',
        serviceTitle: payoutMethod === 'upi' ? `UPI विड्रॉल (${upiId})` : `बँक ट्रान्सफर`,
        descriptionMarathi: `${payoutMethod.toUpperCase()} द्वारे पैसे काढण्याची विनंती पाठवली`,
        payoutDetails: {
          payoutMethod,
          upiId: upiId || '',
          accountNumber: accountNumber || '',
          ifscCode: ifscCode || '',
          holderName: holderName || user.name,
        },
        createdAt: new Date(),
      };

      memoryStore.walletTransactions.unshift(newTx);

      return res.status(201).json({
        success: true,
        message: 'विड्रॉल विनंती यशस्वीरीत्या पाठवली गेली! २४ तासांत रक्कम जमा होईल.',
        transaction: newTx,
        newBalance: user.walletBalance,
      });
    }
  } catch (error) {
    console.error('Withdrawal Request Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminWithdrawals = async (req, res) => {
  try {
    if (getIsMongoConnected()) {
      const withdrawals = await WalletTransaction.find({ type: 'withdrawal' })
        .populate('agentId', 'name phone email')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: withdrawals.length, withdrawals });
    } else {
      const withdrawals = memoryStore.walletTransactions.filter((t) => t.type === 'withdrawal');
      return res.json({ success: true, count: withdrawals.length, withdrawals });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'cleared' } = req.body;

    if (getIsMongoConnected()) {
      const tx = await WalletTransaction.findById(id);
      if (!tx) return res.status(404).json({ success: false, message: 'व्यवहार सापडला नाही.' });

      tx.status = status;
      tx.processedAt = new Date();
      await tx.save();

      return res.json({ success: true, message: 'विड्रॉल मंजूर झाले!', transaction: tx });
    } else {
      const tx = memoryStore.walletTransactions.find((t) => String(t._id) === String(id));
      if (!tx) return res.status(404).json({ success: false, message: 'व्यवहार सापडला नाही.' });

      tx.status = status;
      tx.processedAt = new Date();
      return res.json({ success: true, message: 'विड्रॉल मंजूर झाले!', transaction: tx });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
