# Бот для гида по Старобешевскому водохранилищу

Бот отвечает на `/start` и `/guide` и присылает кнопку «Открыть гид», которая открывает Mini App из `tg-webapp/`.
Mini App выкладывается вместе с сайтом и доступна по адресу https://starobeshevo-fishing-app.netlify.app/tg/.

```bash
cd tg-bot
pip install -r requirements.txt
export BOT_TOKEN="<токен от @BotFather>"
export WEBAPP_URL="https://starobeshevo-fishing-app.netlify.app/tg/"   # слэш на конце обязателен
python bot.py
```

Бот работает через long polling, поэтому его нужно держать запущенным на своём компьютере или сервере (Netlify не запускает Python-процессы).
Чтобы кнопка была видна в чате всегда: `@BotFather` → `/mybots` → бот → Bot Settings → Menu Button, указать тот же адрес.
