# 🇮🇳 YojanaDut (योजना दूत पोर्टल)
### Online Citizen Services & Government Document Assistance Portal with Referral/Agent ("Yojana Dut") Program

> **Primary Language:** Marathi (मराठी) with English bilingual support  
> **Color Theme:** Deep Forest Green (`#064E3B` / `#0F5132`), Warm Orange/Saffron (`#EA580C` / `#F97316`), and Soft Cream (`#FAF9F6`)

---

## 📸 Overview & Key Highlights

**YojanaDut** is a full-stack MERN application that provides online assistance for essential citizen documents and government schemes (PAN Card, Aadhaar updates, Income Certificate, Farmer ID, 7/12 extracts, Caste Certificates) alongside an incentivized rural referral ("Yojana Dut") partner program.

1. **Homepage / Landing View**:
   - Deep Forest Green Hero banner with authentic Indian family graphic and floating referral earnings card (`या महिन्याची रेफरल कमाई: ₹1,890`).
   - 5 service category filter tabs (ओळखपत्र सेवा, दाखले / प्रमाणपत्र, शेतकरी सेवा, ऑनलाईन शासकीय सेवा, सायबर कॅफे / CSC).
   - Popular services grid with prices, SLA timelines, and referral reward chips.
   - 3-step referral promotion banner (`Referral करून कमवा`).
   - Quick wallet overview snippet (`उपलब्ध शिल्लक: ₹455`, `प्रलंबित: ₹50`, `मंजूर: ₹1,240`).
   - Latest government announcements & notice board widget.
   - Persistent WhatsApp quick-assist button at the bottom-right corner.

2. **Application Status Tracking (`/track-status`)**:
   - Search by Application Number (`YD-XXXXX`) or registered mobile number's last 4 digits.
   - 5-stage visual progress stepper (`अर्ज प्राप्त` ➔ `तपासणी` ➔ `कागदपत्रे` ➔ `प्रक्रियेत` ➔ `पूर्ण`).
   - Status badges:
     - `YD-24081`: उत्पन्न दाखला · सुनीता पाटील [• प्रक्रियेत] (Stage 4)
     - `YD-24077`: पॅन कार्ड (नवीन / दुरुस्ती) · गणेश जाधव [• पूर्ण] (Stage 5 - All 5 steps completed)
     - `YD-24072`: शेतकरी ओळखपत्र (Farmer ID) · आशा शिंदे [• कागदपत्रे हवी] (Action required with re-upload modal)

3. **Service Details Page (`/services/:slug`)**:
   - Comprehensive checklist of required documents with checkmark icons.
   - 4-step transparent facilitation process.
   - Independent service legal disclaimer.
   - Sticky pricing card with service fee, timeline, partner reward, "सेवा अर्ज करा" button, and direct WhatsApp query button.

4. **Agent ("Yojana Dut") & Wallet Dashboard**:
   - Unique referral code & link generator (`YD-RAHUL100`) with 1-click copy & WhatsApp sharing.
   - Real-time commission ledger with filters (`All`, `Pending`, `Cleared`).
   - Direct withdrawal request modal to UPI ID or Bank account.

5. **Admin Panel (`/admin`)**:
   - Analytics overview: Total applications, active agents, total payouts, platform revenue.
   - Pipeline manager: Advance stages 1 through 5, request document re-upload, change status.
   - Services editor: Configure fees, commissions, and SLA timelines.

---

## 🏗️ Directory Structure

```
maha-seva-connect/
├── client/                     # Frontend (React 19, Vite, Tailwind CSS)
│   ├── public/
│   │   ├── hero-family.jpg     # Generated high-resolution rural family visual
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Icons.jsx   # Zero-dependency Lucide-compatible SVG icons
│   │   │   │   ├── Navbar.jsx  # Header with branding, notifications, and language switch
│   │   │   │   ├── Footer.jsx  # Deep forest green footer with legal disclaimer
│   │   │   │   └── WhatsAppFloatingButton.jsx # Interactive WhatsApp assistant
│   │   │   ├── home/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── CategoryFilter.jsx
│   │   │   │   ├── PopularServicesGrid.jsx
│   │   │   │   ├── ReferralAndWalletSection.jsx
│   │   │   │   └── NoticesAndHelpWidget.jsx
│   │   │   ├── track/
│   │   │   │   └── TrackStatusPage.jsx
│   │   │   ├── service/
│   │   │   │   └── ServiceDetailPage.jsx
│   │   │   ├── agent/
│   │   │   │   └── AgentDashboard.jsx
│   │   │   ├── wallet/
│   │   │   │   └── WalletPage.jsx
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   └── modals/
│   │   │       ├── ApplyServiceModal.jsx
│   │   │       ├── AuthModal.jsx
│   │   │       └── WithdrawModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── services/
│   │   │   └── api.js          # REST client with robust memory/offline fallback
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
└── server/                     # Backend (Node.js, Express, MongoDB, Mongoose)
    ├── config/
    │   └── db.js               # MongoDB connection + automatic In-Memory Store fallback
    ├── controllers/
    │   ├── authController.js
    │   ├── serviceController.js
    │   ├── applicationController.js
    │   ├── walletController.js
    │   └── noticeController.js
    ├── data/
    │   └── seedData.js         # Pre-seeded services, applications, and notices
    ├── middleware/
    │   ├── auth.js             # JWT verification and role-based guards
    │   └── upload.js           # Multer file upload handler
    ├── models/
    │   ├── User.js
    │   ├── Service.js
    │   ├── Application.js
    │   ├── WalletTransaction.js
    │   └── Notice.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── serviceRoutes.js
    │   ├── applicationRoutes.js
    │   ├── walletRoutes.js
    │   └── noticeRoutes.js
    ├── server.js
    └── package.json
```

---

## ⚡ Getting Started

### 1. Run Backend Server
```bash
cd maha-seva-connect/server
npm install
node server.js
```
The server will run on **`http://localhost:5000`**.  
*Note: The backend automatically connects to MongoDB if available (`mongodb://localhost:27017/yojanadut`), or seamlessly operates using an In-Memory Datastore if MongoDB is not locally running.*

### 2. Run Frontend Client
```bash
cd maha-seva-connect/client
npm install
npm run dev
```
The client will launch on **`http://localhost:5173`** (or `5174`).

---

## 🔑 Demo Credentials (1-Click Switchable in UI)

| Role | Name | Mobile / Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Agent** | राहुल शिंदे | `9822012345` | `agent123` | Code: `YD-RAHUL100`, Balance: ₹455 |
| **Admin** | प्रशासक (Admin) | `9876543210` | `admin123` | Full pipeline control |
| **Citizen** | सुनीता पाटील | `9850123456` | `user123` | Applicant for `YD-24081` |

---

## 📋 Pre-Seeded Tracking Numbers for Quick Demo

- **`YD-24081`**: उत्पन्न दाखला · सुनीता पाटील — **`• प्रक्रियेत`** (Stage 4)
- **`YD-24077`**: पॅन कार्ड (नवीन / दुरुस्ती) · गणेश जाधव — **`• पूर्ण`** (Stage 5)
- **`YD-24072`**: शेतकरी ओळखपत्र · आशा शिंदे — **`• कागदपत्रे हवी`** (Stage 3 - Re-upload test)
