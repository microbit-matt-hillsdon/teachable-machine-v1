import IntlMessageFormat from "intl-messageformat";
const localStorageLocaleKey = "locale";

class I18n {
  constructor() {
    const langParam = new URLSearchParams(document.location.search).get("lang");
    this.locale = langParam ?? this.#getStoredLocale() ?? "en";
  }

  async initialise() {
    this.#configHtmlLang();
    await this.#load();
    this.#translatePage();
  }

  #getStoredLocale() {
    return localStorage.getItem(localStorageLocaleKey)
  }

  async #load() {
    try {
      const response = await fetch(`static/lang/ui.${this.locale}.json`);
      this.messages = await response.json();
    } catch (_err) {
      console.warn(`Locale not supported: ${this.locale}`);
      this.locale = this.#getStoredLocale() ?? "en";
      return this.#load();
    }
    // Save locale.
    localStorage.setItem(localStorageLocaleKey, this.locale);
    // Pre-compile message formatters.
    this.formatters = {};
    for (const [key, message] of Object.entries(this.messages)) {
      this.formatters[key] = new IntlMessageFormat(message, this.locale);
    }
  }

  #configHtmlLang() {
    const htmlEl = document.querySelector("html")
    htmlEl.lang = this.locale
  }

  t(key, values = {}) {
    if (!this.formatters[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    return this.formatters[key].format(values);
  }

  #translatePage() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      const params = el.dataset.i18nParams
        ? JSON.parse(el.dataset.i18nParams)
        : {};
      el.textContent = this.t(key, params);
    });
  }
}

export default I18n;
