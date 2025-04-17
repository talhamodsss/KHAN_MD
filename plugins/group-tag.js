const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "hidetag",
  react: "🔊",
  desc: "To Tag all Members for Message",
  category: "group",
  use: '.hidetag hello',
  filename: __filename
},
async (conn, mek, m, {
  from, quoted, q, isGroup, isCreator, isAdmins,
  participants, reply
}) => {
  try {
    const isUrl = (url) => {
      return /https?:\/\/(www\.)?[\w\-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([\w\-@:%_\+.~#?&//=]*)/.test(url);
    };

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins && !isCreator) return reply("❌ Only group admins can use this command.");

    let messageContent;

    if (quoted) {
      const buffer = await quoted.download();
      const mtype = quoted.mtype;

      switch (mtype) {
        case "imageMessage":
          messageContent = {
            image: buffer,
            caption: quoted.text || "📷 Image",
            mentions: participants.map(u => u.id)
          };
          break;
        case "videoMessage":
          messageContent = {
            video: buffer,
            caption: quoted.text || "🎥 Video",
            mentions: participants.map(u => u.id)
          };
          break;
        case "audioMessage":
          messageContent = {
            audio: buffer,
            ptt: quoted.ptt || false,
            mimetype: "audio/mp4",
            mentions: participants.map(u => u.id)
          };
          break;
        default:
          messageContent = {
            text: quoted.text || "📨 Message",
            mentions: participants.map(u => u.id)
          };
      }

      return await conn.sendMessage(from, messageContent, { quoted: mek });
    }

    if (!q) return reply("*Please provide a message or reply to one.*");

    if (isUrl(q)) {
      return await conn.sendMessage(from, {
        text: q,
        mentions: participants.map(u => u.id)
      }, { quoted: mek });
    }

    await conn.sendMessage(from, {
      text: q,
      mentions: participants.map(u => u.id)
    }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply(`❌ *Error Occurred !!*\n\n${e}`);
  }
});
