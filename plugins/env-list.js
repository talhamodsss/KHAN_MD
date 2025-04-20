const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Helper function to update config.env
function updateConfig(key, value) {
  const envPath = path.join(__dirname, '../config.env');
  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
  
  envContent = envContent.split('\n')
    .filter(line => !line.startsWith(key + '='))
    .join('\n');
  
  envContent += `\n${key}=${value}`;
  writeFileSync(envPath, envContent.trim());
  return true;
}

cmd({
  pattern: "env",
  alias: ["setting","set"],
  desc: "Manage bot environment variables",
  category: "owner",
  filename: __filename,
  use: '<option>',
  react: "⚙️"
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isCreator, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
  if (!isCreator) return reply("❌ This command is only for bot owner!");

  const heading = [
    `╭━━━〔 *${config.BOT_NAME}* 〕━━━┈⊷`,
    `┃★│ Owner : *${config.OWNER_NAME}*`,
    `┃★│ Baileys : *Multi Device*`,
    `┃★│ Type : *NodeJs*`,
    `┃★│ Platform : *Heroku*`,
    `┃★│ Mode : *[${config.MODE}]*`,
    `┃★│ Prifix : *[${config.PREFIX}]*`,
    `┃★│ Version : *3.0.0 Bᴇᴛᴀ*`,
    `╰────────────╯`,
    "",
    "📌 *Reply with number within 3 minutes*",
    ""
  ].join("\n");

  const options = [
    "1️⃣ *AUTO FUNCTIONS*",
    "╭─────────────────",
    "│1. Auto Status Seen: " + (config.AUTO_STATUS_SEEN === "true" ? "✅" : "❌"),
    "│2. Auto Status Reply: " + (config.AUTO_STATUS_REPLY === "true" ? "✅" : "❌"),
    "│3. Auto Status React: " + (config.AUTO_STATUS_REACT === "true" ? "✅" : "❌"),
    "│4. Auto Read Messages: " + (config.READ_MESSAGE === "true" ? "✅" : "❌"),
    "│5. Auto React: " + (config.AUTO_REACT === "true" ? "✅" : "❌"),
    "│6. Auto Reply: " + (config.AUTO_REPLY === "true" ? "✅" : "❌"),
    "│7. Auto Typing: " + (config.AUTO_TYPING === "true" ? "✅" : "❌"),
    "│8. Auto Recording: " + (config.AUTO_RECORDING === "true" ? "✅" : "❌"),
    "╰─────────────────",
    "",
    "2️⃣ *SECURITY*",
    "╭─────────────────",
    "│9. Anti Bad Words: " + (config.ANTI_BAD === "true" ? "✅" : "❌"),
    "│10. Anti Links: " + (config.ANTI_LINK === "true" ? "✅" : "❌"),
    "│11. Anti View Once: " + (config.ANTI_VV === "true" ? "✅" : "❌"),
    "│12. Delete Links: " + (config.DELETE_LINKS === "true" ? "✅" : "❌"),
    "│13. Anti Delete Path: " + config.ANTI_DEL_PATH,
    "╰─────────────────",
    "",
    "3️⃣ *MEDIA*",
    "╭─────────────────",
    "│14. Auto Voice: " + (config.AUTO_VOICE === "true" ? "✅" : "❌"),
    "│15. Auto Sticker: " + (config.AUTO_STICKER === "true" ? "✅" : "❌"),
    "│16. Read Commands: " + (config.READ_CMD === "true" ? "✅" : "❌"),
    "│17. Sticker Pack: " + config.STICKER_NAME,
    "╰─────────────────",
    "",
    "4️⃣ *OTHER SETTINGS*",
    "╭─────────────────",
    "│18. Custom React: " + (config.CUSTOM_REACT === "true" ? "✅" : "❌"),
    "│19. Mention Reply: " + (config.MENTION_REPLY === "true" ? "✅" : "❌"),
    "│20. Always Online: " + (config.ALWAYS_ONLINE === "true" ? "✅" : "❌"),
    "│21. Public Mode: " + (config.PUBLIC_MODE === "true" ? "✅" : "❌"),
    "╰─────────────────",
    "",
    "5️⃣ *EDIT VALUES*",
    "╭─────────────────",
    "│22. Edit Status Message",
    "│23. Edit Alive Message",
    "│24. Edit Custom Emojis",
    "│25. Edit Menu Image URL",
    "│26. Edit Alive Image URL",
    "│27. Edit Sticker Pack",
    "│28. Edit Anti Delete Path",
    "╰─────────────────",
    "",
    config.DESCRIPTION
  ].join("\n");

  const externalAdReply = {
    title: `⚙️ ${config.BOT_NAME} ENV CONTROL`,
    body: config.DESCRIPTION,
    thumbnailUrl: config.MENU_IMAGE_URL,
    mediaType: 1,
    mediaUrl: config.ALIVE_IMG,
    sourceUrl: '',
    showAdAttribution: true
  };

  const sentMsg = await conn.sendMessage(from, {
    text: heading + options,
    footer: `Dev: ${config.DEV} | ${config.STICKER_NAME}`,
    headerType: 1,
    externalAdReply: externalAdReply
  }, { quoted: mek });

  const messageID = sentMsg.key.id;
  let timer = 180; // 3 minutes in seconds

  // Countdown timer
  const countdown = setInterval(() => {
    timer--;
    if (timer <= 0) {
      clearInterval(countdown);
      conn.sendMessage(from, { 
        text: "❌ Menu expired after 3 minutes. Please use the command again." 
      }, { quoted: mek });
    }
  }, 1000);

  const responseHandler = async (msgData) => {
    const receivedMsg = msgData.messages[0];
    if (!receivedMsg.message) return;

    const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
    const senderID = receivedMsg.key.remoteJid;
    const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

    if (isReplyToBot && senderID === from) {
      clearInterval(countdown);
      conn.ev.off("messages.upsert", responseHandler);

      await conn.sendMessage(senderID, {
        react: { text: '⬇️', key: receivedMsg.key }
      });

      try {
        switch (receivedText) {
          // Auto Functions
          case "1":
            updateConfig("AUTO_STATUS_SEEN", config.AUTO_STATUS_SEEN === "true" ? "false" : "true");
            reply(`✅ Auto Status Seen ${config.AUTO_STATUS_SEEN === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "2":
            updateConfig("AUTO_STATUS_REPLY", config.AUTO_STATUS_REPLY === "true" ? "false" : "true");
            reply(`✅ Auto Status Reply ${config.AUTO_STATUS_REPLY === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "3":
            updateConfig("AUTO_STATUS_REACT", config.AUTO_STATUS_REACT === "true" ? "false" : "true");
            reply(`✅ Auto Status React ${config.AUTO_STATUS_REACT === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "4":
            updateConfig("READ_MESSAGE", config.READ_MESSAGE === "true" ? "false" : "true");
            reply(`✅ Read Messages ${config.READ_MESSAGE === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "5":
            updateConfig("AUTO_REACT", config.AUTO_REACT === "true" ? "false" : "true");
            reply(`✅ Auto React ${config.AUTO_REACT === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "6":
            updateConfig("AUTO_REPLY", config.AUTO_REPLY === "true" ? "false" : "true");
            reply(`✅ Auto Reply ${config.AUTO_REPLY === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "7":
            updateConfig("AUTO_TYPING", config.AUTO_TYPING === "true" ? "false" : "true");
            reply(`✅ Auto Typing ${config.AUTO_TYPING === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "8":
            updateConfig("AUTO_RECORDING", config.AUTO_RECORDING === "true" ? "false" : "true");
            reply(`✅ Auto Recording ${config.AUTO_RECORDING === "true" ? "Disabled" : "Enabled"}`);
            break;

          // Security
          case "9":
            updateConfig("ANTI_BAD", config.ANTI_BAD === "true" ? "false" : "true");
            reply(`✅ Anti Bad Words ${config.ANTI_BAD === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "10":
            updateConfig("ANTI_LINK", config.ANTI_LINK === "true" ? "false" : "true");
            reply(`✅ Anti Links ${config.ANTI_LINK === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "11":
            updateConfig("ANTI_VV", config.ANTI_VV === "true" ? "false" : "true");
            reply(`✅ Anti View Once ${config.ANTI_VV === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "12":
            updateConfig("DELETE_LINKS", config.DELETE_LINKS === "true" ? "false" : "true");
            reply(`✅ Delete Links ${config.DELETE_LINKS === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "13":
            reply("📝 Set Anti Delete Path (log/same):");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newPath = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                if (['log', 'same'].includes(newPath.toLowerCase())) {
                  updateConfig("ANTI_DEL_PATH", newPath.toLowerCase());
                  reply(`✅ Anti Delete Path set to: ${newPath}`);
                } else {
                  reply("❌ Invalid path! Use 'log' or 'same'");
                }
              }
            });
            break;

          // Media
          case "14":
            updateConfig("AUTO_VOICE", config.AUTO_VOICE === "true" ? "false" : "true");
            reply(`✅ Auto Voice ${config.AUTO_VOICE === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "15":
            updateConfig("AUTO_STICKER", config.AUTO_STICKER === "true" ? "false" : "true");
            reply(`✅ Auto Sticker ${config.AUTO_STICKER === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "16":
            updateConfig("READ_CMD", config.READ_CMD === "true" ? "false" : "true");
            reply(`✅ Read Commands ${config.READ_CMD === "true" ? "Disabled" : "Enabled"}`);
            break;

          // Other Settings
          case "18":
            updateConfig("CUSTOM_REACT", config.CUSTOM_REACT === "true" ? "false" : "true");
            reply(`✅ Custom React ${config.CUSTOM_REACT === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "19":
            updateConfig("MENTION_REPLY", config.MENTION_REPLY === "true" ? "false" : "true");
            reply(`✅ Mention Reply ${config.MENTION_REPLY === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "20":
            updateConfig("ALWAYS_ONLINE", config.ALWAYS_ONLINE === "true" ? "false" : "true");
            reply(`✅ Always Online ${config.ALWAYS_ONLINE === "true" ? "Disabled" : "Enabled"}`);
            break;
          case "21":
            updateConfig("PUBLIC_MODE", config.PUBLIC_MODE === "true" ? "false" : "true");
            reply(`✅ Public Mode ${config.PUBLIC_MODE === "true" ? "Disabled" : "Enabled"}`);
            break;

          // Edit Values
          case "22":
            reply("📝 Send new status message:");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newMsg = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                updateConfig("AUTO_STATUS_MSG", newMsg);
                reply("✅ Status message updated!");
              }
            });
            break;
          case "23":
            reply("📝 Send new alive message:");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newMsg = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                updateConfig("LIVE_MSG", newMsg);
                reply("✅ Alive message updated!");
              }
            });
            break;
          case "24":
            reply("📝 Send new custom emojis (comma separated):");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newEmojis = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                updateConfig("CUSTOM_REACT_EMOJIS", newEmojis);
                reply("✅ Custom emojis updated!");
              }
            });
            break;
          case "25":
            reply("📝 Send new menu image URL:");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newUrl = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                if (isUrl(newUrl)) {
                  updateConfig("MENU_IMAGE_URL", newUrl);
                  reply("✅ Menu image URL updated!");
                } else {
                  reply("❌ Invalid URL format!");
                }
              }
            });
            break;
          case "26":
            reply("📝 Send new alive image URL:");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newUrl = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                if (isUrl(newUrl)) {
                  updateConfig("ALIVE_IMG", newUrl);
                  reply("✅ Alive image URL updated!");
                } else {
                  reply("❌ Invalid URL format!");
                }
              }
            });
            break;
          case "27":
            reply("📝 Send new sticker pack name:");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newName = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                updateConfig("STICKER_NAME", newName);
                reply("✅ Sticker pack name updated!");
              }
            });
            break;
          case "28":
            reply("📝 Set Anti Delete Path (log/same):");
            conn.ev.once("messages.upsert", async (editData) => {
              const editMsg = editData.messages[0];
              if (editMsg.key.remoteJid === from) {
                const newPath = editMsg.message.conversation || editMsg.message.extendedTextMessage?.text;
                if (['log', 'same'].includes(newPath.toLowerCase())) {
                  updateConfig("ANTI_DEL_PATH", newPath.toLowerCase());
                  reply(`✅ Anti Delete Path set to: ${newPath}`);
                } else {
                  reply("❌ Invalid path! Use 'log' or 'same'");
                }
              }
            });
            break;

          default:
            reply("❌ Invalid option! Please reply with a valid number from the menu.");
        }
      } catch (error) {
        console.error("Error:", error);
        reply("❌ An error occurred while processing your request.");
      }
    }
  };

  conn.ev.on("messages.upsert", responseHandler);

  // Auto remove listener after 3 minutes
  setTimeout(() => {
    conn.ev.off("messages.upsert", responseHandler);
  }, 180000);
});
