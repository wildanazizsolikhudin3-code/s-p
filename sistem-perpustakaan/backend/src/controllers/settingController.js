const db = require('../config/database');

const getSettings = async (req, res) => {
  try {
    const [settings] = await db.query('SELECT * FROM settings ORDER BY setting_key');
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.setting_key] = s.setting_value;
    });
    res.json({ success: true, data: settingsObj, list: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan.' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = req.body; // { key: value, ... }

    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
        [String(value), key]
      );
    }

    res.json({ success: true, message: 'Pengaturan berhasil diperbarui.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengaturan.' });
  }
};

module.exports = { getSettings, updateSettings };
