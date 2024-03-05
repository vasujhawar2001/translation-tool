const { Translate } = require("@google-cloud/translate").v2;
const fs = require("fs/promises");
const path = require("path");
const config = require("./config.json");

// while testing remove ../../../
// and paste credentials.json in root then, npm link
const CREDENTIALS = require("../../../"+config.credentialsPath); 
// const CREDENTIALS  = require('./credentials.json')

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

  async function removeIdentifierInPlace(obj) {
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
  
  const updateTranslations = async (sourceFile, targetLanguages) => {
    try {
      // Read English translation file
      const sourceData = JSON.parse(await fs.readFile(sourceFile, "utf-8"));

      // Get the namespace (filename without extension)
      const namespace = path.basename(sourceFile, path.extname(sourceFile));

      // Update translations recursively
      await updateTranslationsRecursive(sourceData, targetLanguages, namespace);

      await removeIdentifierInPlace(sourceData);

      // Update the English file
      await fs.writeFile(
        sourceFile,
        JSON.stringify(sourceData, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error(`Error reading ${sourceFile} --> ${error}`);
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
// const sourceFile = "public/locales/en/home.json";
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

const addKey = async (namespace, key, value) => {
  try {
    // Define the path to the namespace file
    const filePath = path.join(config.localesPath, config.sourceLanguage, `${namespace}.json`);

    await ensureFileExists(filePath);
    // Read the namespace file
    const namespaceData = JSON.parse(await fs.readFile(filePath, "utf-8"));

    // Split the key into segments
    const segments = key.split('.');

    // Initialize a reference to traverse the nested structure
    let currentObj = namespaceData;

    // Traverse the nested structure to find the innermost object
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!currentObj[segment] || typeof currentObj[segment] !== 'object') {
        currentObj[segment] = {};
      }
      currentObj = currentObj[segment];
    }

    // Add the innermost key with the corresponding value
    currentObj[`^${segments[segments.length - 1]}`] = value;

    // Write the updated data back to the file
    await fs.writeFile(
      filePath,
      JSON.stringify(namespaceData, null, 2),
      "utf-8"
    );

    //console.log(`Key "${key}" added to ${namespace}.json`);
  } catch (error) {
    console.error(`Error adding key "${key}" to ${namespace}.json --> ${error}`);
  }
};


module.exports = {
  translateText,
  updateTranslations,
  updateTranslationsFolder,
  ensureFileExists,
  addKey
}

