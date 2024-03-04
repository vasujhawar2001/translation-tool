const  translationUtils = require("./translationUtils");

const englishFile = "./locales/en/common.json";
const targetLanguages = ["es", "fr"]; // add languages carefully, the modified/newly added keys(^) will be translated in all target languages

translationUtils.updateTranslations(englishFile, targetLanguages);
