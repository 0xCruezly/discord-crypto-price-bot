# Crypto Discord Bot 🪙

Bot Discord sederhana yang menampilkan harga dan perubahan persentase kripto dari CoinGecko secara otomatis.  
Bot ini akan memperbarui **presence**, **nickname**, **avatar**, dan **deskripsi aplikasi** secara berkala.

![Contoh Tampilan](screenshot.png)

## ✨ Fitur

- 📊 Menampilkan harga terkini (dengan simbol mata uang pilihan)
- 📈 Perubahan harga dalam 1 jam, 24 jam, 7 hari, 14 hari, dan 30 hari
- 🏷️ Mengubah nickname bot sesuai harga (di semua server)
- 🖼️ Mengganti avatar bot dengan logo koin (hanya sekali)
- 📝 Memperbarui deskripsi aplikasi bot dengan ringkasan harga
- 🔁 Update otomatis setiap interval yang dapat diatur
- 🛡️ Error handling yang baik (bot tidak crash)

## 🛠️ Prasyarat

- Node.js v16.9.0 atau lebih tinggi
- Akun Discord dan bot yang sudah dibuat di [Discord Developer Portal](https://discord.com/developers/applications)
- Token bot dengan izin:
  - `Change Nickname`
  - `Manage Webhooks` (opsional, untuk presence)

## 📦 Instalasi

1. Clone repositori ini:
   ```bash
   git clone https://github.com/0xCruezly/crypto-discord-bot.git
   cd crypto-discord-bot
