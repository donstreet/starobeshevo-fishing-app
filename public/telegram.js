(function () {
  function getTG() {
    return (window.Telegram && window.Telegram.WebApp) || null;
  }

  const TGApp = {
    isTelegram() { return !!getTG(); },

    init() {
      const tg = getTG();
      if (!tg) return;
      try {
        tg.ready();
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#0b1d26');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#0b1d26');
      } catch (e) {}
    },

    haptic(style) {
      const tg = getTG();
      if (!tg || !tg.HapticFeedback) return;
      try {
        if (style === 'success' || style === 'error' || style === 'warning') {
          tg.HapticFeedback.notificationOccurred(style);
        } else {
          tg.HapticFeedback.impactOccurred(style || 'light');
        }
      } catch (e) {}
    },

    showBack(onBack) {
      const tg = getTG();
      if (!tg || !tg.BackButton) return;
      try {
        tg.BackButton.show();
        tg.BackButton.onClick(onBack);
      } catch (e) {}
    },

    hideBack() {
      const tg = getTG();
      if (!tg || !tg.BackButton) return;
      try { tg.BackButton.hide(); } catch (e) {}
    },

    openLink(url) {
      const tg = getTG();
      if (tg && tg.openLink) {
        try { tg.openLink(url, { try_instant_view: false }); return; } catch (e) {}
      }
      window.open(url, '_blank', 'noopener');
    },

    openTelegramLink(url) {
      const tg = getTG();
      if (tg && tg.openTelegramLink) {
        try { tg.openTelegramLink(url); return; } catch (e) {}
      }
      window.open(url, '_blank', 'noopener');
    },
  };

  window.TGApp = TGApp;
  document.addEventListener('DOMContentLoaded', () => TGApp.init());
})();