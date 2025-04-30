import bcrypt from "bcryptjs";

async function main() {
  const password = "superadmin123";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log("Password:", password);
  console.log("Hash:", hash);
  
  // 验证哈希值
  const isValid = await bcrypt.compare(password, hash);
  console.log("Hash is valid:", isValid);
}

main().catch(console.error); 