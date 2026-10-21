import os
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = os.environ["BOT_TOKEN"]
# Адрес со слэшем на конце, например https://starobeshevo-fishing-app.netlify.app/tg/
WEBAPP_URL = os.environ["WEBAPP_URL"]

WELCOME = (
    "Гид по Старобешевскому водохранилищу.\n\n"
    "Выберите рыбу, способ ловли и месяц, чтобы получить глубину, дистанцию, "
    "приманку и актуальные ограничения. Точки со схемы — во вкладке «Точки»."
)


def open_button() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([[
        InlineKeyboardButton("Открыть гид", web_app=WebAppInfo(url=WEBAPP_URL))
    ]])


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(WELCOME, reply_markup=open_button())


async def guide(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Открыть гид:", reply_markup=open_button())


def main() -> None:
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("guide", guide))
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
