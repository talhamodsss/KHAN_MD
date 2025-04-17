const { cmd } = require('../command');

cmd({
  pattern: "jid",
  alias: ["id", "gjid", "chatid"],  
  react: "🆔",
  desc: "Get the JID of current group or chat",
  category: "utility",
  use: '.jid',
  filename: __filename
},
async (conn, mek, m, {
  from, isGroup, isCreator, reply
}) => {
  try {
    // Only creator can use this command
    if (!isCreator) return reply("❌ Only the creator can use this command.");

    if (isGroup) {
      return reply(`👥 *Group JID:*\n${from}`);
    } else {
      return reply(`👤 *Chat JID:*\n${from.split('@')[0]}`); // Remove server part in PMs
    }
  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred !!*\n\n${e.message}`);
  }
});
