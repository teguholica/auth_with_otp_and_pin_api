const crypto = require("crypto");

function generateOtp(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += crypto.randomInt(0, 10).toString();
  }
  return code;
}

module.exports = { generateOtp };
