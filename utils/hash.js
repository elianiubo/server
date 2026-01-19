// hash.js
import bcrypt from "bcryptjs";

const password = "ncrgmr86s22c495s";

const run = async () => {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
  

};

run();
