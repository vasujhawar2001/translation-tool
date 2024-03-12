# @stratupai/translation-tool

A command-line tool for generating translation files for i18next using the Google Cloud Translate API (Language Detection Model v2).

[Implement Internationalization ](#internationalization) with the help of i18next.

## Getting Started

Before using this tool, ensure you have enabled the Google Cloud Translation API and obtained the necessary credentials. Please refer to the [Google Cloud Translation API Documentation](https://cloud.google.com/translate/docs/setup) for detailed instructions.

### Step 1: Enable Google Cloud Translation API

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project.
3. Navigate to APIs & Services > Cloud Translation API.
4. Enable the API.

### Step 2: Obtain Credentials

1. Create the access credentials as described in the [Google Workspace documentation](https://developers.google.com/workspace/guides/create-credentials).
2. Rename the credentials file to `credentials.json`.
3. Place `credentials.json` in the root directory of your project.

For a detailed walkthrough, you can watch this [video tutorial](https://www.youtube.com/watch?v=Sjl9ilOpHG8&t=29s).

### Step 3: Installation

Install the package via npm:

```bash
npm install @stratupai/translation-tool
```

### Step 4: Verify Installation
Type the following command in your terminal to check the default configuration:
```bash
translate
```

## Usage

Default configuration:
```json
{
  "localesPath": "public/locales",
  "credentialsPath": "credentials.json",
  "sourceLanguage": "en",
  "targetLanguages": [
    "ar",
    "fr",
    "es",
    "ja"
  ]
}
```

The `translate` command-line tool offers various options and commands to facilitate translation tasks. Below are the available options and commands along with examples of how to use them:

### Options

- `-l, --localesPath <path-to>`: Specifies the path for the locales directory. By default, it uses the path specified in the configuration file.

- `-c, --credentialsPath <path>`: Specifies the path for the credentials file. By default, it uses the path specified in the configuration file.

- `-s, --sourceLanguage <code>`: Specifies the source language code or source locale folder. By default, it uses the source language specified in the configuration file.

- `-t, --targetLanguages <codes...>`: Specifies the target languages to translate into. Multiple target languages can be provided, separated by spaces. By default, it uses the target languages specified in the configuration file.

```bash
translate -l src/locales -s en -t fr es de
```

### Commands

Add or Update Key
- `modify-key <namespace> <key> <value>`: Adds or updates a key-value pair in the specified namespace and translates it.
```bash
translate modify-key common "greeting" "Hello, world!"
```

Translate
- `run-translations [languages...]`: Translates modified keys(keys prefixed with ^ symbol) and updates all translation files for the specified languages. Languages are optional, if not provided it looks for all source files to translate.
```bash
translate run-translations
```

- `update-namespace <namespace>`: Updates the entire translation file for the specified namespace and adds caret (^) to all keys.
  Example: `translate update-namespace common`

### Note - For namespace just give the file name (do not add .json extension)

- `update-locales`: Updates all source folder files and adds caret (^) to all untranslated keys.
  Example: `translate update-locales`

For more information on each command and option, use the `--help` flag with the command. For example:
`translate run-translations --help`

## Internationalization

For examples of using i18next with React and Next.js, refer to the following resources:

- [i18next Documentation](https://www.i18next.com/how-to/add-or-load-translations)
- [React Tutorial](https://www.youtube.com/watch?v=w04LXKlusCQ)
- [Next.js Tutorial](https://locize.com/blog/next-app-dir-i18n/)

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the [ISC License](LICENSE).
