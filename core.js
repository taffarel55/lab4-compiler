const instructionsList = [
  { instruction: "LW", group: "DT", num: "0" },
  { instruction: "SW", group: "DT", num: "1" },
  { instruction: "MOV", group: "DT", num: "2" },
  { instruction: "ADD", group: "AL", num: "3" },
  { instruction: "SUB", group: "AL", num: "4" },
  { instruction: "MUL", group: "AL", num: "5" },
  { instruction: "DIV", group: "AL", num: "6" },
  { instruction: "AND", group: "AL", num: "7" },
  { instruction: "OR", group: "AL", num: "8" },
  { instruction: "SHL", group: "AL", num: "9" },
  { instruction: "SHR", group: "AL", num: "10" },
  { instruction: "CMP", group: "AL", num: "11" },
  { instruction: "NOT", group: "AL", num: "12" },
  { instruction: "JR", group: "CT", num: "13" },
  { instruction: "JPC", group: "CT", num: "14" },
  { instruction: "BRFL", group: "CT", num: "15" },
  { instruction: "CALL", group: "CT", num: "16" },
  { instruction: "RET", group: "CT", num: "17" },
  { instruction: "NOP", group: "CT", num: "18" },
];

const processCode = (codeBase, file, debug) => {
  const sanitizedInstructions = codeBase
    // Coloca tudo em maiusculo para ser case insensitive
    .toUpperCase()
    // Substitui dois ou mais espaços consecutivos por um espaço
    .replace(/ {2,}/g, " ")
    // Separa as instruções por ; ou \n
    .split(/;|\n/)
    // Remove os espaços em branco no início e no final de cada instrução
    .map((inst) => inst.trim())
    // Remove linhas vazias
    .filter((inst) => inst.length);

  if (debug) {
    console.log(
      `%cSANITIZADO:`,
      "font-weight: bold; font-size: 16px;",
      JSON.stringify(sanitizedInstructions, null, 2)
    );
  }

  const errors = [];
  const instructionsDecoded = [];

  // Análise dos mnemônicos
  sanitizedInstructions.forEach((str, index) => {
    // Divide os operandos por espaços ou vírgulas ou parênteses
    const parts = str.replace(")", "").split(/[\s,(]+/);
    const matchingInstruction = instructionsList.find(
      (instruction) => parts[0] === instruction.instruction
    );

    const line = index + 1;

    if (matchingInstruction) {
      instructionsDecoded.push({
        line,
        mnemonic: matchingInstruction.instruction,
        number: matchingInstruction.num,
        group: matchingInstruction.group, // Adiciona a informação do grupo
        body: parts.slice(1).join(" "), // Junta o restante com espaços novamente
      });
    } else {
      errors.push({
        line,
        msg: `use of undeclared identifier '${parts[0]}'`,
      });
    }
  });

  if (debug) {
    console.log(
      `%cANÁLISE DOS MNEMÔNICOS:`,
      "font-weight: bold; font-size: 16px;",
      JSON.stringify(instructionsDecoded, null, 2)
    );
  }

  const instructionsTokenized = [];

  // Análise léxica
  instructionsDecoded.forEach((instruction) => {
    const mnemonic = instruction.mnemonic;
    const operands = instruction.body.split(" ");
    const numOfOperands = operands.length;
    let tokens;

    switch (instruction.group) {
      case "DT":
        if (numOfOperands === 3 || numOfOperands === 2) {
          switch (mnemonic) {
            case "LW":
              tokens = {
                destiny: operands[0],
                immediate: operands[1],
                base: numOfOperands === 3 ? operands[2] : "",
              };
              break;
            case "SW":
              tokens = {
                source: operands[0],
                immediate: operands[1],
                base: numOfOperands === 3 ? operands[2] : "",
              };
              break;
            case "MOV":
              tokens = {
                destiny: operands[0],
                source: operands[1],
              };
              break;
          }

          instructionsTokenized.push({
            ...instruction,
            numOfOperands,
            ...tokens,
          });
        } else {
          errors.push({
            line: instruction.line,
            msg: `for instruction ${
              instruction.mnemonic
            } the size of operands is too ${
              operands.length > 3 ? "large" : "small"
            }`,
          });
        }
        break;
      case "AL":
        if (numOfOperands > 0 && numOfOperands < 5) {
          switch (numOfOperands) {
            case 1:
              tokens = {
                operand1: operands[0],
                destiny: operands[0],
              };
              break;
            case 2:
              tokens = {
                destiny: operands[0],
                operand1: operands[0],
                operand2: operands[1],
              };
              break;
            case 3:
              tokens = {
                destiny: operands[0],
                operand1: operands[1],
                operand2: operands[2],
              };
            case 4:
              tokens = {
                destiny: operands[0],
                operand1: operands[1],
                operand2: operands[2],
                immediate: operands[3],
              };

            default:
              break;
          }

          instructionsTokenized.push({
            ...instruction,
            numOfOperands,
            ...tokens,
          });
        } else {
          errors.push({
            line: instruction.line,
            msg: `for instruction ${
              instruction.mnemonic
            } the size of operands is too ${
              operands.length > 4 ? "large" : "small"
            }`,
          });
        }
        break;
      case "CT":
        if (numOfOperands === 0 || numOfOperands === 1 || numOfOperands === 3) {
          switch (mnemonic) {
            case "JR":
              if (numOfOperands == 1) {
                tokens = {
                  address: operands[0],
                };
              } else {
                errors.push({
                  line: instruction.line,
                  msg: `for instruction ${mnemonic} the size of operands is wrong, check the instruction set`,
                });
              }
              break;
            case "JPC":
              if (numOfOperands == 1) {
                tokens = {
                  immediate: operands[0],
                };
              } else {
                errors.push({
                  line: instruction.line,
                  msg: `for instruction ${mnemonic} the size of operands is wrong, check the instruction set`,
                });
              }
              break;
            case "JPC":
              if (numOfOperands == 1) {
                tokens = {
                  immediate: operands[0],
                };
              } else {
                errors.push({
                  line: instruction.line,
                  msg: `for instruction ${mnemonic} the size of operands is wrong, check the instruction set`,
                });
              }
              break;
            case "BRFL":
              if (numOfOperands == 3) {
                tokens = {
                  address: operands[0],
                  vector: operands[1],
                  mask: operands[2],
                };
              } else {
                errors.push({
                  line: instruction.line,
                  msg: `for instruction ${mnemonic} the size of operands is wrong, check the instruction set`,
                });
              }
              break;
            case "CALL":
              if (numOfOperands == 1) {
                tokens = {
                  address: operands[0],
                };
              } else {
                errors.push({
                  line: instruction.line,
                  msg: `for instruction ${mnemonic} the size of operands is wrong, check the instruction set`,
                });
              }
              break;
          }

          instructionsTokenized.push({
            ...instruction,
            numOfOperands,
            ...tokens,
          });
        } else {
          errors.push({
            line: instruction.line,
            msg: `for instruction ${instruction.mnemonic} the size of operands is wrong, check the instruction set`,
          });
        }
        break;
    }
  });

  if (debug) {
    console.log(
      `%cANÁLISE LÉXICA:`,
      "font-weight: bold; font-size: 16px;",
      JSON.stringify(instructionsTokenized, null, 2)
    );
  }

  // Análise semântica (verificar erros semânticos)

  instructionsTokenized.forEach((instruction) => {
    const {
      mnemonic,
      group,
      destiny,
      base,
      source,
      operand1,
      operand2,
      immediate,
      address,
      vector,
      mask,
      numOfOperands,
    } = instruction;

    const destinyPattern = /^R([2-9]|[12]\d|3[01])$/;
    const sourcePattern = /^R([0-9]|[12]\d|3[01])$/;

    if (destiny && !destiny.match(destinyPattern)) {
      errors.push({
        line: instruction.line,
        msg: `for instruction ${mnemonic} the destiny range is between R[2,31]`,
      });
    }

    if (
      (base && !base?.match(sourcePattern)) ||
      (source && !source?.match(sourcePattern))
    ) {
      errors.push({
        line: instruction.line,
        msg: `for instruction ${mnemonic} the base and source range is between R[0,31]`,
      });
    }

    if (
      group == "DT" &&
      mnemonic !== "MOV" &&
      !(Number(immediate) > -32768 || Number(immediate) < 32767)
    ) {
      errors.push({
        line: instruction.line,
        msg: `for instruction ${mnemonic} the immediate is between [-32768,32767]`,
      });
    }

    if (
      group == "AL" &&
      (!operand1.match(sourcePattern) ||
        (operand2 && !operand2.match(sourcePattern)))
    ) {
      errors.push({
        line: instruction.line,
        msg: `for instruction ${mnemonic} the source range is between R[0,31]`,
      });
    }

    if (
      group == "AL" &&
      numOfOperands === 4 &&
      !(Number(immediate) > -1024 || Number(immediate) < 1023)
    ) {
      errors.push({
        line: instruction.line,
        msg: `for instruction ${mnemonic} the immediate is between [-1024,1023]`,
      });
    }

    if (
      mnemonic === "JPC" &&
      !(Number(immediate) > -33554432 || Number(immediate) < 33554431)
    ) {
      errors.push({
        line: instruction.line,
        msg: `for instruction ${mnemonic} the immediate is between [-33554432,33554431]`,
      });
    } else if (group === "CT" && mnemonic !== "RET" && mnemonic !== "NOP") {
      if (mnemonic === "CALL" || mnemonic === "JR" || mnemonic === "BRFL") {
        if (address && !address.match(destinyPattern)) {
          errors.push({
            line: instruction.line,
            msg: `for instruction ${mnemonic} the address range is between R[2,31]`,
          });
        }
      }
      if (mnemonic === "BRFL") {
        if (
          !(Number(vector) > -128 || Number(vector) < 127) ||
          !(Number(mask) > -128 || Number(mask) < 127)
        ) {
          errors.push({
            line: instruction.line,
            msg: `for instruction ${mnemonic} the vector and mask is between [-128,127]`,
          });
        }
      }
    }
  });

  if (debug) {
    console.log(
      `%cANÁLISE SEMÂNTICA OK`,
      "font-weight: bold; font-size: 16px; color: green;"
    );
  }

  // Geração de erros
  errors.forEach((error) => {
    console.error(`${file}:${error.line}: error: ${error.msg}`);
  });

  const toBinary = (value, N) => {
    const stringValue = value.toString();
    // Remove o "R" se tiver e converte para número
    let number = parseInt(
      stringValue.includes("R") ? stringValue.slice(1) : stringValue,
      10
    );
    // Converte para binário e preenche com zeros à esquerda
    return number.toString(2).padStart(N, "0") + "_";
  };

  // Geração do código de máquina
  if (errors.length > 0) {
    console.error(`${errors.length} errors generated.\nexit status 1`);
    return false;
  } else {
    const finalCode = instructionsTokenized.map((instruction) => {
      const {
        mnemonic,
        destiny,
        immediate,
        base,
        number,
        source,
        operand1,
        operand2,
        address,
        vector,
        mask,
      } = instruction;
      switch (mnemonic) {
        case "LW":
          return (
            toBinary(number, 5) +
            toBinary(destiny, 5) +
            toBinary(immediate, 16) +
            toBinary("0", 1) +
            toBinary(base, 5)
          );
        case "SW":
          return (
            toBinary(number, 5) +
            toBinary(source, 5) +
            toBinary(immediate, 16) +
            toBinary(0, 1) +
            toBinary(base, 5)
          );
        case "MOV":
          return (
            toBinary(number, 5) +
            toBinary(destiny, 5) +
            toBinary(0, 17) +
            toBinary(source, 5)
          );
        case "ADD":
        case "SUB":
        case "MUL":
        case "DIV":
        case "AND":
        case "OR":
        case "SHL":
        case "SHR":
        case "CMP":
        case "NOT":
          return (
            toBinary(number, 5) +
            toBinary(destiny, 5) +
            toBinary(operand1, 5) +
            toBinary(operand2 ? operand2 : 0, 5) +
            toBinary(immediate ? immediate : 0, 12)
          );
        case "BRFL":
        case "JR":
        case "CALL":
          return (
            toBinary(number, 5) +
            toBinary(address, 13) +
            toBinary(vector ? vector : 0, 5) +
            toBinary(mask ? mask : 0, 5)
          );
        case "JPC":
          return toBinary(number, 5) + toBinary(immediate, 27);
        case "RET":
        case "NOP":
          return toBinary(number, 5) + toBinary(0, 27);
        default:
          return "Não implementado";
      }
    });

    let machineCode = finalCode.map((line) => line.replace(/_([^_]*)$/, "$1"));

    return machineCode.join("\n");
  }
};

export default processCode;
