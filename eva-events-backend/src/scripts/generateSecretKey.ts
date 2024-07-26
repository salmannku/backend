const crypto = require("crypto");

export const generateSecretKey = () => {
  console.log(
    `-------------------- Generating secret key --------------------\n`
  );

  const id = crypto.randomBytes(50).toString("hex");

  console.log(`Your secret key is`);
  console.log(`${id}\n`);
  console.log(
    `-------------------- Secret key is generated --------------------`
  );
};

generateSecretKey();
