// scripts/refactor-inline-css.js


const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { globby } = require('globby');
const mkdirp = require("mkdirp");

const LOG_FILE = "logs/inline-style-refactor.log";
const OUTPUT_CSS_FILE = "static/css/inline-extracted.css";
let styleCounter = 0;
let extractedStyles = [];

mkdirp.sync("logs");
mkdirp.sync(path.dirname(OUTPUT_CSS_FILE));

function extractStylesFromLine(line, lineNum, filePath) {
  const matches = [...line.matchAll(/style=["'](.*?)["']/gi)];
  let newLine = line;

  matches.forEach((match) => {
    const style = match[1];
    const className = `extracted-style-${styleCounter++}`;
    extractedStyles.push(`.${className} { ${style} }`);
    newLine = newLine.replace(match[0], `class=\"${className}\"`);

    fs.appendFileSync(
      LOG_FILE,
      `🔧 ${filePath}:${lineNum}\n→ ${match[0]}\n→ replaced with class=\"${className}\"\n\n`
    );
  });

  return newLine;
}

async function refactorFile(filePath) {
  const tempPath = `${filePath}.tmp`;
  const input = fs.createReadStream(filePath);
  const output = fs.createWriteStream(tempPath);
  const rl = readline.createInterface({ input });
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;
    const newLine = extractStylesFromLine(line, lineNum, filePath);
    output.write(newLine + "\n");
  }

  output.end();
  output.on("finish", () => {
    fs.renameSync(tempPath, filePath);
  });
}

(async () => {
  console.log("🚀 Refactor started...");
  fs.writeFileSync(LOG_FILE, "🧾 Inline CSS Refactor Log\n\n");
  const paths = await globby(["**/*.{html,htm}", "!node_modules", "!**/.git/**"], {
    gitignore: true,
  });

  for (const file of paths) {
    await refactorFile(file);
  }

  if (extractedStyles.length > 0) {
    fs.writeFileSync(OUTPUT_CSS_FILE, extractedStyles.join("\n") + "\n", {
      flag: "w",
    });
    console.log(`✅ Extracted ${extractedStyles.length} styles to ${OUTPUT_CSS_FILE}`);
  } else {
    console.log("🎉 No inline styles found to refactor.");
  }

  console.log(`📓 Log written to ${LOG_FILE}`);
})();
