#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const config = require('./config.json')
const {updateTranslationsFolder} =  require('./translationUtils.js')

// Define program
program
  .option('-l, --localesPath <path>', 'Path for locales directory')
  .option('-c, --credentialsPath <path>', 'Path for Credentials file')
  .option('-s, --sourceLanguage <code>', 'Source language code')
  .option('-t, --targetLanguages <codes>', 'Target languages (comma separated)')
  .command('update translations')
  .description('Updating all translation files')
  .action(() => {
      if(Object.keys(config).length<4){
        console.error("Invalid configuration, one or more arguments  missing.");
    }
    const sourceLanguage = config.sourceLanguage; 
    const localesPath = config.localesPath

    const sourceFolder = `${localesPath}/${sourceLanguage}`;

    const targetLanguages = config.targetLanguages;
    updateTranslationsFolder(sourceFolder, targetLanguages);
    console.log("Sucessfully Updated Translations.")
  })
  .parse(process.argv);


async function main() {
  // Parse command-line arguments
  const options = program.opts();
  const { localesPath, credentialsPath, sourceLanguage, targetLanguages } = options;

  // Validate required arguments
  if ((!credentialsPath && !sourceLanguage && !targetLanguages  && !localesPath) && (Object.keys(config).length!=4)) {
    console.error('No arguments provided.');
    program.help(); // Display help message
    process.exit(1); // Exit with error code
  }


    // Create an object with the inputs
    const inputData = {
        localesPath: !localesPath ? config.localesPath : localesPath,
        credentialsPath : !credentialsPath ? config.credentialsPath : credentialsPath,
        sourceLanguage: !sourceLanguage ? config.sourceLanguage : sourceLanguage,
        targetLanguages:  !targetLanguages ?  config.targetLanguages: targetLanguages.split(',')
      };
    
      // Convert object to JSON
      const jsonData = JSON.stringify(inputData, null, 2);

      // Write JSON data to a file
      fs.writeFile('node_modules/@stratup/translation-tool/config.json', jsonData, (err) => {
        if (err) {
          console.error('Error writing to config file:', err);
        } else {
          console.log('Input data saved to config.json');
        }
      });    

}

// Run main function
main();