# 💜 FinSight — Smart Expense Tracker

A fully-featured React Native mobile app for expense tracking, built with Firebase backend, offline support, and AI-powered spending insights.

> Designed & developed based on the FinSight UI/UX spec by Sagor Chandra Sutra Dhar (ID: 26113660)

---

## 📱 Features

| Feature | Details |
|---|---|
| **Home Dashboard** | Balance card, income vs expense summary, quick actions, wallet overview, AI banner |
| **Transactions** | Full CRUD, search, filter by category/type/date, color-coded, grouped by date |
| **Bills & Planning** | Add/edit bills, due dates, repeat options, reminder toggle, status (Paid/Upcoming/Overdue) |
| **Insights** | Pie chart (categories), line chart (trends), AI suggestions, savings rate |
| **Receipts** | Camera capture, gallery upload, link to transaction, Firebase Storage, offline fallback |
| **Profile** | Wallet management, currency selector, notification settings, sign out |
| **Auth** | Firebase Email/Password login & registration |
| **Offline** | AsyncStorage persistence — full app works without internet |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.73 |
| Navigation | React Navigation 6 (Stack + Bottom Tabs) |
| State | React Context API + useReducer |
| Backend | Firebase (Auth + Firestore + Storage) |
| Offline | AsyncStorage (JSON key-value) |
| Charts | react-native-chart-kit |
| Images | react-native-image-picker |
| Styling | StyleSheet + react-native-linear-gradient |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- React Native CLI (`npm install -g react-native`)
- Xcode (iOS) or Android Studio (Android)
- A Firebase project

---

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/FinSight.git
cd FinSight
npm install

# iOS only
cd ios && pod install && cd ..
```

---

### Step 2 — Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `FinSight`
3. Enable **Google Analytics** (optional)

#### Enable Firebase Services:

**Authentication:**
- Firebase Console → Authentication → Sign-in method
- Enable **Email/Password**

**Firestore:**
- Firebase Console → Firestore Database → Create database
- Start in **production mode**
- Choose a region (e.g. `us-central`)
- After creation, go to **Rules** tab and paste the content of `firestore.rules`

**Storage:**
- Firebase Console → Storage → Get started
- After creation, go to **Rules** tab and paste the content of `storage.rules`

---

### Step 3 — Add Firebase Config

**Get your config:**
- Firebase Console → Project Settings → Your apps
- Click **Add app** → Choose platform (Web for JS SDK, or iOS/Android for native SDK)
- Copy the `firebaseConfig` object

**Paste into** `src/services/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "finsight-abc.firebaseapp.com",
  projectId: "finsight-abc",
  storageBucket: "finsight-abc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

**For native Firebase SDK (recommended for production):**
- Download `google-services.json` → place in `/android/app/`
- Download `GoogleService-Info.plist` → place in `/ios/FinSight/`

---

### Step 4 — Run the App

```bash
# Start Metro bundler
npm start

# iOS
npm run ios

# Android
npm run android
```

---

## 📂 Project Structure

```
FinSight/
├── App.js                          # Root entry point
├── src/
│   ├── context/
│   │   └── AppContext.js           # Global state (wallets, transactions, bills...)
│   ├── navigation/
│   │   └── AppNavigator.js         # Stack + Tab navigation
│   ├── screens/
│   │   ├── AuthScreen.js           # Login + Register
│   │   ├── HomeScreen.js           # Dashboard
│   │   ├── TransactionsScreen.js   # Transaction list
│   │   ├── AddTransactionScreen.js # Add/Edit transaction
│   │   ├── BillsScreen.js          # Bills & planning
│   │   ├── InsightsScreen.js       # Charts & AI suggestions
│   │   ├── ReceiptsScreen.js       # Receipt capture/upload
│   │   └── ProfileScreen.js        # Profile, wallets, settings
│   ├── components/
│   │   └── index.js                # Shared UI components
│   ├── services/
│   │   ├── firebase.js             # Firebase SDK helpers
│   │   ├── storage.js              # AsyncStorage wrapper
│   │   └── firestore-schema.js     # DB schema documentation
│   └── utils/
│       └── theme.js                # Colors, spacing, typography
├── firestore.rules                 # Firestore security rules
├── storage.rules                   # Firebase Storage rules
├── firebase.json                   # Firebase project config
├── firestore.indexes.json          # Composite indexes
└── .env.example                    # Environment variable template
```

---

## 🗄 Database Schema

### Firestore Structure

```
users/
  {uid}/
    displayName, email, currency, notifications

    wallets/
      {walletId}/
        name, type, balance, color, icon

    transactions/
      {txId}/
        type, amount, description, category,
        walletId, date, note, receiptId, location

    bills/
      {billId}/
        name, amount, category, dueDate,
        repeat, reminder, status

    receipts/
      {receiptId}/
        imageUrl, localUri, merchant, amount,
        date, linkedTransactionId, location

    aiSuggestions/
      {sugId}/
        title, description, icon, read
```

### AsyncStorage Keys (offline)

| Key | Content |
|---|---|
| `@finsight_wallets` | `Wallet[]` |
| `@finsight_transactions` | `Transaction[]` |
| `@finsight_bills` | `Bill[]` |
| `@finsight_receipts` | `Receipt[]` |
| `@finsight_settings` | `{ currency, notifications }` |

---

## 🔐 Security Rules

### Firestore (`firestore.rules`)
- All user data is locked to authenticated users by `request.auth.uid`
- No cross-user data access possible

### Storage (`storage.rules`)
- Receipt images only accessible by the owning user

---

## 🧪 Testing Without Firebase

The app works fully in **offline mode** using AsyncStorage. On first launch with no Firebase config, demo data is pre-loaded:
- 3 wallets (Cash, Bank, Credit Card)
- 5 sample transactions
- Charts and insights use this data

To test auth-protected features, add a valid Firebase config.

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#7C3AED` (violet) |
| Income | `#10B981` (green) |
| Expense | `#EF4444` (red) |
| Background | `#F8F7FF` |
| Card | `#FFFFFF` |
| Border | `#E5E7EB` |
| Text Primary | `#1E1B4B` |

---

## 📦 Building for Production

```bash
# Android — signed APK
cd android
./gradlew assembleRelease

# iOS — Archive via Xcode
open ios/FinSight.xcworkspace
# Product → Archive
```

---

## 🐛 Common Issues

| Issue | Fix |
|---|---|
| Metro bundler crash | `npm start -- --reset-cache` |
| iOS pod issues | `cd ios && pod install --repo-update` |
| Android build fail | Check `local.properties` has correct SDK path |
| Firebase auth error | Verify `google-services.json` is in `/android/app/` |
| Image picker not working | Grant camera/gallery permissions on device |

---

## 📄 License

MIT License — Free to use and modify for educational/personal projects.

---

*Built with ❤️ using React Native + Firebase*
