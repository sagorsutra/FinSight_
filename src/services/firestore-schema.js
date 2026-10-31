// firestore-schema.js
// ─── FinSight Firestore Database Schema ───────────────────────────────────────
// This file documents the Firestore collection/document structure.
// All user data lives under: /users/{uid}/...

/*
─────────────────────────────────────────────────────────────────────────────
COLLECTION: users
  DOCUMENT: {uid}
    Fields:
      displayName: string
      email: string
      currency: string ("USD" | "GBP" | "EUR" ...)
      notifications: boolean
      createdAt: timestamp
      updatedAt: timestamp

─────────────────────────────────────────────────────────────────────────────
SUB-COLLECTION: users/{uid}/wallets
  DOCUMENT: {walletId}
    Fields:
      name: string          — "Cash", "Bank Account", etc.
      type: string          — "cash" | "bank" | "credit" | "savings" | "crypto"
      balance: number       — current balance (negative allowed for credit)
      color: string         — hex color for UI
      icon: string          — icon name
      createdAt: timestamp
      updatedAt: timestamp

─────────────────────────────────────────────────────────────────────────────
SUB-COLLECTION: users/{uid}/transactions
  DOCUMENT: {transactionId}
    Fields:
      type: string          — "income" | "expense"
      amount: number        — always positive
      description: string
      category: string      — "Food & Dining" | "Shopping" | "Salary" | ...
      walletId: string      — reference to wallet
      date: timestamp
      note: string?
      receiptId: string?    — optional linked receipt
      location: {           — optional location tag
        name: string,
        latitude: number,
        longitude: number
      }?
      createdAt: timestamp
      updatedAt: timestamp

─────────────────────────────────────────────────────────────────────────────
SUB-COLLECTION: users/{uid}/bills
  DOCUMENT: {billId}
    Fields:
      name: string
      amount: number
      category: string      — "Rent" | "Electricity" | "Subscription" | ...
      dueDate: string       — "YYYY-MM-DD"
      repeat: string        — "One-time" | "Weekly" | "Monthly" | "Yearly"
      reminder: boolean
      status: string        — "upcoming" | "paid" | "overdue"
      createdAt: timestamp
      updatedAt: timestamp

─────────────────────────────────────────────────────────────────────────────
SUB-COLLECTION: users/{uid}/receipts
  DOCUMENT: {receiptId}
    Fields:
      imageUrl: string      — Firebase Storage download URL
      localUri: string?     — local file path (offline fallback)
      merchant: string?
      amount: number?
      date: string          — "YYYY-MM-DD"
      linkedTransactionId: string? — optional reference to transaction
      location: {           — optional
        name: string,
        latitude: number,
        longitude: number
      }?
      createdAt: timestamp
      updatedAt: timestamp

─────────────────────────────────────────────────────────────────────────────
SUB-COLLECTION: users/{uid}/aiSuggestions
  DOCUMENT: {suggestionId}
    Fields:
      title: string
      description: string
      icon: string
      category: string
      createdAt: timestamp
      read: boolean

─────────────────────────────────────────────────────────────────────────────
FIREBASE STORAGE:
  receipts/{userId}/{filename}.jpg   — receipt images
  avatars/{userId}/avatar.jpg        — profile photos

─────────────────────────────────────────────────────────────────────────────
FIREBASE SECURITY RULES (firestore.rules):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /wallets/{walletId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /transactions/{txId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /bills/{billId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /receipts/{receiptId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /aiSuggestions/{sugId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}

─────────────────────────────────────────────────────────────────────────────
FIREBASE STORAGE RULES (storage.rules):

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /receipts/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /avatars/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
*/

// ─── AsyncStorage Keys (offline persistence) ──────────────────────────────────
// @finsight_user          — { uid, email, displayName }
// @finsight_wallets       — Wallet[]
// @finsight_transactions  — Transaction[]
// @finsight_bills         — Bill[]
// @finsight_receipts      — Receipt[]
// @finsight_ai_suggestions — AISuggestion[]
// @finsight_settings      — { currency, notifications }

export default {};
