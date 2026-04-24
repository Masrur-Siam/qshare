# 🥭 QShare - Privacy-First Self-Destructing File Sharing SaaS

QShare is an ultra-fast, secure file-sharing platform designed for privacy. Files uploaded to the platform are automatically destroyed after **5 minutes**, ensuring no data remains on the server permanently.

## 🚀 Key Features
- **Auto-Purge Engine:** Powered by Supabase Edge Functions to clean storage automatically every 5 minutes.
- **QR Code Integration:** Instantly generate QR codes for seamless mobile-to-desktop sharing.
- **Zero-Storage Footprint:** Maintains a clean server environment by deleting expired assets.
- **Lightweight & Fast:** Minimalist UI built for speed and efficiency.

## 🛠️ Tech Stack
- **Frontend:** Next.js / React (Tailwind CSS)
- **Backend:** Supabase (PostgreSQL & Storage)
- **Automation:** Supabase Edge Functions (Deno)
- **Scheduling:** pg_cron & pg_net extensions

## ⚙️ How it Works
1. **Upload:** User uploads a file through the QShare interface.
2. **Storage:** The file is stored in a private Supabase bucket with a unique folder ID.
3. **Timer:** A database-level Cron Job triggers an Edge Function every minute.
4. **Purge:** The function checks the `created_at` timestamp. If the file is older than 5 minutes, it is permanently deleted from the storage bucket.

## 🛡️ Security & Privacy
QShare is built with a "Privacy-First" approach. We do not keep logs of your files, and once the 5-minute window expires, the data is wiped both logically from the database and physically from the storage disk.

---
Developed by **Masrur Siam - The Mango Programmer**
