const express = require("express");
const router = express.Router();

const registeredUsers = [];

// 注册
router.post("/register", (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: "所有字段均为必填" });
  }

  if (registeredUsers.find((u) => u.username === username)) {
    return res.status(400).json({ message: "用户名已存在" });
  }

  const newUser = { id: registeredUsers.length + 1, username, password, email };
  registeredUsers.push(newUser);
  res
    .status(201)
    .json({ message: "注册成功", user: { id: newUser.id, username, email } });
});

// 登录
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = registeredUsers.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "用户名或密码错误" });
  }

  res.json({
    message: "登录成功",
    user: { id: user.id, username: user.username, email: user.email },
  });
});

module.exports = router;
