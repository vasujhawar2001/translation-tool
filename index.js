#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const config = require('./config.json');
const { updateTranslationsFolder } = require('./translationUtils.js');

program
  .option('-l, --localesPath <path>', 'Path for locales directory', config.localesPath)
  .option('-s, --sourceLanguage <code>', 'Source language code', config.sourceLanguage)
  .option('-t, --targetLanguages <codes...>', 'Target languages (comma separated)', config.targetLanguages);

program
  .command('update-translations')
  .description('Updating all translation files')
  .action(() => {
    const { localesPath, sourceLanguage, targetLanguages } = program.opts();
    const sourceFolder = `${localesPath}/${sourceLanguage}`;

    updateTranslationsFolder(sourceFolder, targetLanguages);
    console.log("Successfully Updated Translations.");
  });

program
  .action(() => {
    // Default action when only options are provided
    const options = program.opts();
    const { localesPath, sourceLanguage, targetLanguages } = options;

    // Your logic for handling options here
    console.log("Configuration provided:");
    console.log("Locales path:", localesPath);
    console.log("Source language:", sourceLanguage);
    console.log("Target languages:", targetLanguages);
  });

program.parse(process.argv);

async function main() {
  const options = program.opts();
  const { localesPath, sourceLanguage, targetLanguages } = options;

  // Create an object with the inputs
  const inputData = {
    localesPath: localesPath || config.localesPath,
    sourceLanguage: sourceLanguage || config.sourceLanguage,
    targetLanguages: targetLanguages ? targetLanguages : config.targetLanguages
  };

  // Convert object to JSON
  const jsonData = JSON.stringify(inputData, null, 2);

  // Write JSON data to a file
  fs.writeFile('node_modules/@stratupai/translation-tool/config.json', jsonData, (err) => {
    if (err) {
      console.error('Error writing to config file:', err);
    } else {
      console.log(inputData);
    }
  });
}

// Run main function
main();
