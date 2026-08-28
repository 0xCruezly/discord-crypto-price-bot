require("dotenv").config();
const axios = require("axios");
const { Client, GatewayIntentBits } = require("discord.js");

// ==================== KONFIGURASI ====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

let runOnce = 0; // Hanya untuk ganti avatar sekali

// ==================== FUNGSI UTAMA ====================
async function getPrices() {
  try {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${process.env.PREFERRED_CURRENCY}&ids=${process.env.COIN_ID}&price_change_percentage=1h,24h,7d,14d,30d`
    );

    if (!data || !data[0] || !data[0].current_price) {
      console.log(`❌ Data tidak valid untuk ${process.env.COIN_ID}`);
      return;
    }

    const coin = data[0];
    const currentPrice = coin.current_price || 0;
    const priceChange24h = coin.price_change_percentage_24h || 0;
    const priceChange1h = coin.price_change_percentage_1h_in_currency || 0;
    const priceChange7d = coin.price_change_percentage_7d_in_currency || 0;
    const priceChange14d = coin.price_change_percentage_14d_in_currency || 0;
    const priceChange30d = coin.price_change_percentage_30d_in_currency || 0;
    const symbol = coin.symbol || "?";
    const marketCap = coin.market_cap || 0;

    const formatChange = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
    const arrow = (value) => (value >= 0 ? "▲" : "▼");
    const numberWithCommas = (num) =>
      num
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, process.env.THOUSAND_SEPARATOR || ",");

    // -------------------- 1. Update Presence --------------------
    client.user.setPresence({
      activities: [
        {
          name: `${process.env.COIN_ID.toUpperCase()} ${formatChange(priceChange24h)}  ${arrow(priceChange24h)}`,
          type: 3, // WATCHING
        },
      ],
      status: "online",
    });

    // -------------------- 2. Update Avatar (sekali) --------------------
    if (runOnce === 0 && coin.image) {
      await client.user.setAvatar(coin.image).catch((err) =>
        console.error("Gagal ganti avatar:", err.message)
      );
      runOnce = 1;
    }

    // -------------------- 3. Update Nickname di semua server --------------------
    if (!client.token) {
      console.warn("⚠️ Token tidak ada, nickname tidak diupdate.");
    } else {
      const nick =
        process.env.CURRENCY_BEFORE === "true"
          ? `${process.env.CURRENCY_SYMBOL}${numberWithCommas(currentPrice)}`
          : `${numberWithCommas(currentPrice)}${process.env.CURRENCY_SYMBOL}`;

      client.guilds.cache.forEach((guild) => {
        const me = guild.members.me;
        if (!me) return;
        me.setNickname(nick).catch((err) =>
          console.error(`Gagal set nickname di ${guild.name}:`, err.message)
        );
      });
    }

    // -------------------- 4. Update Deskripsi Aplikasi --------------------
    const description = `**${
      process.env.COIN_ID.charAt(0).toUpperCase() + process.env.COIN_ID.slice(1)
    }** (${symbol}) price changes.\n` +
      `${formatChange(priceChange1h)} (1h) ${arrow(priceChange1h)}\n` +
      `${formatChange(priceChange24h)} (24h) ${arrow(priceChange24h)}\n` +
      `${formatChange(priceChange7d)} (7d) ${arrow(priceChange7d)}\n` +
      `${formatChange(priceChange30d)} (1m) ${arrow(priceChange30d)}\n` +
      `Market cap: ${numberWithCommas(marketCap)} ${process.env.PREFERRED_CURRENCY.toUpperCase()}`;

    await client.application.edit({ description }).catch((err) =>
      console.error("Gagal update deskripsi:", err.message)
    );

    console.log(`✅ Harga diperbarui: ${currentPrice} ${process.env.PREFERRED_CURRENCY}`);
  } catch (error) {
    console.error("❌ Error saat mengambil data:", error.message);
  }
}

// ==================== EVENT READY ====================
client.once("ready", () => {
  console.log(`🚀 Login sebagai ${client.user.tag}`);

  // Perbaikan token untuk REST (solusi utama error 401)
  if (process.env.DISCORD_TOKEN) {
    client.rest.setToken(process.env.DISCORD_TOKEN);
  } else {
    console.error("❌ DISCORD_TOKEN tidak ditemukan di .env");
    process.exit(1);
  }

  // Jalankan pertama kali
  getPrices();

  // Interval update (dalam menit, minimal 1)
  const intervalMinutes = Math.max(1, parseInt(process.env.UPDATE_FREQUENCY) || 1);
  setInterval(getPrices, intervalMinutes * 60 * 1000);
  console.log(`⏱️ Update setiap ${intervalMinutes} menit`);
});

// ==================== LOGIN ====================
client.login(process.env.DISCORD_TOKEN);
