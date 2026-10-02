"use strict";

(() => {

// Follow the browser's language preferences and fall back to English.
const dictionary = {
  en: {
    contact: "Contact Manuel", privacy: "Privacy", android: "Android app",
    join: "Join the waitlist", joining: "Joining…", signingUp: "Signing up…",
    busy: "The server is busy. Please try again in a moment.",
    invalidEmail: "Please check your email address and try again.",
    saveFailed: "We couldn’t save your signup. Please try again in a moment.",
    timeout: "That took too long. Please try again.", copied: "Link copied.",
    selectCopy: "Select and copy the link above to share it.",
    shareText: "sudoku42 is almost ready for iPhone and iPad. Join the waitlist to hear when it is ready.",
  },
  nl: {
    contact: "Neem contact op met Manuel", privacy: "Privacy", android: "Android-app",
    heading: "sudoku42 komt nu ook naar de iPad en iPhone! 📲", intro: "Sudoku, maar dan samen. Speel elke dag dezelfde puzzel als iedereen en vergelijk je tijd met spelers over de hele wereld, of los live een gedeeld bord op met vrienden en familie.",
    threshold: "Bij 💯 aanmeldingen breng ik de app ook voor iPhone en iPad uit. Dat is het aantal dat ik nodig heb voordat ik Apples jaarlijkse ontwikkelaarskosten betaal.",
    email: "E-mailadres", join: "Schrijf je in voor de wachtlijst", finePrint: "Met je aanmelding geef je toestemming voor één e-mail zodra sudoku42 voor iPhone en iPad klaar is. Geen nieuwsbrief.", leave: "Uitschrijven kan altijd",
    successHeading: "Je staat op de wachtlijst! 🎉", success: "Ik stuur je een e-mail zodra sudoku42 voor iPhone en iPad klaar is.", anotherEmail: "Gebruik een ander e-mailadres 🔄",
    shareHeading: "Neem iemand mee. 😈", shareIntro: "Met meer spelers wordt sudoku42 leuker. Hoe meer mensen zich aanmelden, hoe sneller de app verschijnt.", share: "Deel de wachtlijst ↗", shareLink: "Link om te delen", copy: "Kopieer de link", emailShare: "Deel via e-mail", preview: "Bekijk de app 👀",
    previewHeading: "Eén sudoku per dag. Voor iedereen. Binnenkort beschikbaar!", previewSubheading: "Vergelijk je tijd met spelers wereldwijd.", previewIntro: "Speel de dagelijkse sudoku die iedereen speelt en vergelijk je tijd met spelers over de hele wereld.", gallery: "Voorbeelden van de sudoku42-app", captionOne: "De puzzel van vandaag, wereldwijd gedeeld.", captionTwo: "Elke zet telt mee voor je tijd.", captionThree: "Vergelijk je tijd met die van andere spelers.", returnWaitlist: "Wachtlijst voor iPhone & iPad 📃",
    joining: "Bezig met aanmelden…", signingUp: "Je wordt aangemeld…", busy: "De server heeft het druk. Probeer het zo nog eens.", invalidEmail: "Controleer je e-mailadres en probeer het opnieuw.", saveFailed: "We konden je aanmelding niet opslaan. Probeer het zo nog eens.", timeout: "Dat duurde te lang. Probeer het opnieuw.", copied: "Link gekopieerd.", selectCopy: "Selecteer en kopieer de link hierboven om hem te delen.", shareText: "sudoku42 komt bijna naar iPhone en iPad. Schrijf je in voor de wachtlijst en hoor het zodra de app klaar is.",
  },
};

const browserLanguages = navigator.languages || [navigator.language || "en"];
const locale = browserLanguages
  .map((language) => language.toLowerCase().split("-")[0])
  .find((language) => Object.hasOwn(dictionary, language)) || "en";
const t = (key) => dictionary[locale][key] || dictionary.en[key] || key;

window.sudoku42Locale = locale;
window.sudoku42T = t;
document.documentElement.lang = locale;
// English is already the server-rendered markup. Only replace it when Dutch
// has been selected from the browser preferences.
if (locale === "nl") {
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const [attribute, key] = element.dataset.i18nAttr.split(":");
    element.setAttribute(attribute, t(key));
  });
}
})();
