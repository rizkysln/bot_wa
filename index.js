const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inisialisasi client WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code Handler
client.on('qr', (qr) => {
  console.log('QR Code tersedia. Silakan scan dengan WhatsApp.');
  qrcode.generate(qr, { small: true });
});

// Ready Handler
client.on('ready', () => {
  console.log('Bot sudah siap digunakan!');
});

// Fungsi untuk menghitung total
function hitungTotal(listBarang) {
  let total = 0;
  let pesanBarang = '';
  let ongkos = 0;

  listBarang.forEach(item => {
    const parts = item.trim().split(' ');
    const harga = parseFloat(parts.pop()); // Ambil harga dari bagian terakhir

    // Gabungkan kembali nama barang dari bagian yang tersisa
    const nama = parts.join(' '); 

    // Cek jika item adalah 'ongkos'
    if (nama.toLowerCase() === 'ongkos') {
      ongkos = harga; // Simpan ongkos
    } else if (!isNaN(harga)) { // Pastikan harga valid
      total += harga;
      pesanBarang += `- ${nama}: ${harga}\n`;
    } else {
      console.error(`Harga tidak valid untuk item: ${item}`);
    }
  });

  return { pesanBarang, total, ongkos };
}

// Handler Pesan Masuk
client.on('message', async (message) => {
  const pesan = message.body.toLowerCase().trim();

  console.log(`Pesan diterima: ${pesan}`); // Tambahkan log ini untuk melihat pesan yang diterima

  if (pesan.startsWith('lapor')) {
    try {
      const listBarang = pesan.replace('lapor', '').trim().split('\n');
      const { pesanBarang, total, ongkos } = hitungTotal(listBarang);

      const totalAkhir = total + ongkos;
      const balasan = `List Orderan:\n${pesanBarang}Ongkos: ${ongkos}\nTotal: ${totalAkhir} ya kk 🙏`;

      await message.reply(balasan);
    } catch (error) {
      console.error('Terjadi kesalahan:', error);
      await message.reply('Format pesan salah. Pastikan formatnya benar!');
    }
  }
});

// Inisialisasi Bot
client.initialize();
