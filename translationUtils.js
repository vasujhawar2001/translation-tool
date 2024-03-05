const { Translate } = require("@google-cloud/translate").v2;
const fs = require("fs/promises");
const path = require("path");
const config = require("./config.json");

const CREDENTIALS = require('./credentials.json');

const translate = new Translate({
  credentials: CREDENTIALS,
  projectId: CREDENTIALS.project_id,
});

const translateText = async (text, targetLanguage) => {
  try {
    const [response] = await translate.translate(text, targetLanguage);
    return response;
    // check for response object
  } catch (error) {
    console.error(`Error at translateText --> ${error}`);
    return null;
  }
};

const updateTranslationsRecursive = async (data, targetLanguages, namespace, currentPath = []) => {
    for (const [key, value] of Object.entries(data)) {
      // Create the current path
      const updatedPath = [...currentPath, key];
  
      // Check if the key has the modification identifier
      if (key.startsWith("^")) {
        const modifiedKey = key.slice(1); 
  
        // Translate the modified key-value pair for each target language
        for (const targetLanguage of targetLanguages) {
          const targetFile = `${config.localesPath}/${targetLanguage}/${namespace}.json`;  // --> this also need to be changes and given to terminal
  
          try {
            await ensureFileExists(targetFile);
            // Read and update the target language file
            const targetData = JSON.parse(
              await fs.readFile(targetFile, "utf-8")
            );
  
            // Use a helper function to set the nested value in the targetData
            setObjectValue(targetData, updatedPath, modifiedKey, await translateText(value, targetLanguage));
  
            await fs.writeFile(
              targetFile,
              JSON.stringify(targetData, null, 2),
              "utf-8"
            );
          } catch (error) {
            console.error(`Error updating ${targetLanguage} file --> ${error}`);
          }
        }
      }
  
      // Recursively process nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        await updateTranslationsRecursive(value, targetLanguages, namespace, updatedPath);
      }
    }
    
  };

  function removeIdentifierInPlace(obj) {
    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                obj[index] = removeIdentifierInPlace(item);
            });
        } else {
            for (let key in obj) {
                if (key.startsWith('^')) {
                    const newKey = key.substring(1);
                    obj[newKey] = obj[key];
                    delete obj[key];
                    removeIdentifierInPlace(obj[newKey]);
                } else {
                    removeIdentifierInPlace(obj[key]);
                }
            }
        }
    }
}
  
  const setObjectValue = (obj, path, key, value) => {
    let currentObj = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (!currentObj[segment]) {
        currentObj[segment] = {};
      }
      currentObj = currentObj[segment];
    }
    currentObj[key] = value;
  };
  
  const updateTranslations = async (englishFile, targetLanguages) => {
    try {
      // Read English translation file
      const englishData = JSON.parse(await fs.readFile(englishFile, "utf-8"));

      // Get the namespace (filename without extension)
      const namespace = path.basename(englishFile, path.extname(englishFile));

      // Update translations recursively
      await updateTranslationsRecursive(englishData, targetLanguages, namespace);

      const updatedEnglishData = removeIdentifierInPlace(englishData);
  
      // Update the English file
      await fs.writeFile(
        englishFile,
        JSON.stringify(englishData, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error(`Error reading ${englishFile} --> ${error}`);
    }
  };

  const ensureFileExists = async (filePath) => {
    try {
      await fs.access(filePath, fs.constants.F_OK);
    } catch (error) {
      const parentDir = path.dirname(filePath);
      try {
          await fs.access(parentDir, fs.constants.F_OK);
      } catch (error) {
          // If the directory doesn't exist, create it
          await fs.mkdir(parentDir, { recursive: true });
      }
      // If the file doesn't exist, create an empty one
      await fs.writeFile(filePath, '{}', 'utf-8');
    }
};
  
// Example usage
// const englishFile = "public/locales/en/home.json";
// const targetLanguages = ["es", "fr"];

const updateTranslationsFolder = async (folderPath, targetLanguages) => {
  try {

    await ensureFileExists(folderPath);
    // Get all files in the "en" folder
    const files = await fs.readdir(folderPath);

    // Loop through each file and update translations
    for (const file of files) {
      const filePath = path.join(folderPath, file);

      // Check if the file is a JSON file
      if (file.endsWith('.json')) {
        await updateTranslations(filePath, targetLanguages);
      }
    }
  } catch (error) {
    console.error(`Error reading files in ${folderPath} --> ${error}`);
  }
};

module.exports = {
  translateText,
  updateTranslations,
  updateTranslationsFolder,
  ensureFileExists
}

