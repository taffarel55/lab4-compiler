#!/usr/bin/env node
"use strict";

import fs from "fs";
import minimist from "minimist";
import processCode from "./core.js";

const argv = minimist(process.argv.slice(2));

if (argv._.length !== 1) {
  console.error(
    "Erro: Argumento do arquivo ausente. Use: node script.js arquivo.asm [--debug=true|false]"
  );
  process.exit(1);
}

const arquivo = argv._[0];
const debug = argv.debug === "true";

fs.readFile(arquivo, "utf8", (err, data) => {
  if (err) {
    console.error(`Erro ao ler o arquivo: ${err}`);
    process.exit(1);
  }

  const machineCode = processCode(data, arquivo, debug);

  if (machineCode) {
    fs.writeFile(arquivo + ".txt", machineCode, "utf8", (err) => {
      if (err) {
        console.error(`Erro ao escrever o arquivo de saída: ${err}`);
        process.exit(1);
      }

      console.log(`Arquivo de saída (${arquivo + ".txt"}) criado com sucesso.`);
    });
  }
});
