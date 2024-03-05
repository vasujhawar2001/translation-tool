const fs = require('fs');
const path = require('path');

function addCaretToKeys(data) {
    if (typeof data === 'object' && !Array.isArray(data)) {
        const newData = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const newKey = typeof data[key] !== 'object' && !key.startsWith('^') ? `^${key}` : key;
                newData[newKey] = addCaretToKeys(data[key]);
            }
        }
        return newData;
    } else if (Array.isArray(data)) {
        return data.map(item => addCaretToKeys(item));
    } else {
        return data;
    }
}
// use this function to add Identifier(^) to all keys and proceed to tanslate the file to targeted langauge.
async function addCaretToFile(filePath) {
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const modifiedData = await addCaretToKeys(jsonData);
    const modifiedJsonString = JSON.stringify(modifiedData, null, 2);

    fs.writeFileSync(filePath, modifiedJsonString, 'utf-8');
}
/*
**************IMPORTANT NOTE*******************
USE THE ABOVE FUNCTION ONLY IF YOU WANT TO RUN IT FOR THE WHOLE FILE. It will add the identifier,
and then later you can run translation function.
*/
// Example Usage
// const filePath = 'src/app/i18n/locales/en/common.json'; 
// addCaretToFile(filePath); 


/*
***************IMPORTANT NOTE***********************:
BEWARE OF USING addCaretToAllFiles(), This should only be used to add a whole new language translations to codebase.
It will run for all namspaces and key-value pair in the en directory.

1) Create an empty directory with the name as its lang code in public/locales/{langCode}
2) Then use the below function to add the identifier(^) to all keys in the source directory(en),
3) Run updateAllTranslations.js (BE CAREFUL of targeted languages don't use the language which is already been translated,
it will waste the google translate API credits).
*/

function addCaretToAllFiles(folderPath) {
    const files = fs.readdirSync(folderPath);
    
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        
        if (fs.statSync(filePath).isFile() && path.extname(filePath) === '.json') {
            // Only process JSON files
            const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const modifiedData = addCaretToKeys(jsonData);
            const modifiedJsonString = JSON.stringify(modifiedData, null, 2);
            
            fs.writeFileSync(filePath, modifiedJsonString, 'utf-8');
            console.log(`Processed: ${filePath}`);
        }
    });
}

// const sourceFolderPath = 'src/app/i18n/locales/en'; // source folder for translation

// addCaretToAllFiles(sourceFolderPath);
module.exports = {
    addCaretToAllFiles,
    addCaretToFile
}