#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const config = require('./config.json');
const { updateTranslationsFolder, addKey } = require('./translationUtils.js');
const {addCaretToFile, addCaretToAllFiles} = require('./addCaret.js')

program
  .option('-l, --localesPath <path>', 'Path for locales directory', config.localesPath)
  .option('-c, --credentialsPath <path>', 'Path for credentials', config.credentialsPath)
  .option('-s, --sourceLanguage <code>', 'Source language code', config.sourceLanguage)
  .option('-t, --targetLanguages <codes...>', 'Target languages (backspace seperated)', config.targetLanguages);

  program
  .command('run-translations [languages...]')
  .description('Translate modified keys and run all translation files.')
  .action((languages) => {
    const { localesPath, sourceLanguage, targetLanguages } = program.opts();
    const sourceFolder = `${localesPath}/${sourceLanguage}`;

    // Use the provided languages or the default target languages
    const languagesToTranslate = languages.length > 0 ? languages : targetLanguages;
    console.log(languagesToTranslate)
    updateTranslationsFolder(sourceFolder, languagesToTranslate)
      .then(() => {
        console.log("Successfully Updated Translations.");
      })
      .catch(error => {
        console.error('An error occurred while updating translations:', error);
      });
  });

  program
  .command('modify-key <namespace> <key> <value>')
  .description('Add/update a key-value pair to namespace (translates too)')
  .action((namespace, key, value) => {
    const { localesPath, sourceLanguage, targetLanguages } = program.opts();

    addKey(namespace, key, value)
    .then(()=>{
      const sourceFolder = `${localesPath}/${sourceLanguage}`;
      console.log(`Key "${key}" modified at ${sourceFolder}/${namespace}.json`);
      
      updateTranslationsFolder(sourceFolder, targetLanguages);
      console.log("Successfully Updated Translations.");
    })
  });

  program
  .command('update-namespace <namespace>')
  .description('Update whole translation file')
  .action((namespace)=>{
    const { localesPath, sourceLanguage } = program.opts();
    try{
      const filePath= `${localesPath}/${sourceLanguage}/${namespace}.json`
      addCaretToFile(filePath)
      console.log(`Updated ${filePath}. Now run <run-translations> to translate.`)
    }
    catch(err){
      console.error(err)
    }
  })

  program
  .command('update-locales')
  .description('Updates all source folder files.')
  .action(()=>{
    const { localesPath, sourceLanguage } = program.opts();
    try{
      const folderPath= `${localesPath}/${sourceLanguage}`
      addCaretToAllFiles(folderPath)
      console.log(`Updated all files. Now run <run-translations> to translate.`)
    }
    catch(err){
      console.error(err)
    }
  })

program
  .action(() => {
    // Default action when only options are provided
    const options = program.opts();
    const { localesPath, credentialsPath, sourceLanguage, targetLanguages } = options;

    console.log("Configuration provided:");
    console.log("Locales path:", localesPath);
    console.log("Credentials path:", credentialsPath);
    console.log("Source language:", sourceLanguage);
    console.log("Target languages:", targetLanguages);
  });

program.parse(process.argv);

async function main() {
  const options = program.opts();
  const { localesPath, credentialsPath, sourceLanguage, targetLanguages } = options;

  // Create an object with the inputs
  const inputData = {
    localesPath: localesPath || config.localesPath,
    credentialsPath: credentialsPath || config.credentialsPath,
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
      //console.log(inputData);
    }
  });
}

// Run main function
main();
