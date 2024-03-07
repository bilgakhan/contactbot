require("dotenv").config(); // Load environment variables from .env file
const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const bot = new Telegraf(BOT_TOKEN);

// Map to store the chat IDs of users who send messages
const userChatIds = new Map();

// Middleware to forward messages to the admin
bot.use((ctx, next) => {
  const chatId = ctx.message.chat.id;
  const fromId = ctx.message.from.id;

  // Check if the message is written by someone other than the admin
  if (fromId !== ADMIN_CHAT_ID) {
    // Forward the message to the admin
    bot.telegram.forwardMessage(ADMIN_CHAT_ID, chatId, ctx.message.message_id);

    // Store the chat ID of the user who sent the message
    userChatIds.set(chatId, fromId);
  }
  next();
});

// Start command handler
bot.start((ctx) => {
  ctx.reply(
    "Salom! Xabaringizni va kontaktingizni shu yerda yozib qoldiring. Men tez orada siz bilan bog'laman"
  );
});

// Handle callback queries (admin's replies)
bot.on("callback_query", (ctx) => {
  const senderChatId = userChatIds.get(ctx.callbackQuery.message.chat.id);
  const message = ctx.callbackQuery.message.text;

  // Deliver the admin's reply to the original sender
  if (senderChatId) {
    bot.telegram.sendMessage(senderChatId, `Admin javob berdi: ${message}`);
  }
});

// Start the bot
bot.launch();
