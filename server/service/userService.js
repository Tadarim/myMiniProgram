const express = require("express");
const router = express.Router();

const users = [
  { id: 1, name: "张三", email: "zhangsan@example.com" },
  { id: 2, name: "李四", email: "lisi@example.com" },
];

// 获取所有用户
router.get("/users", (req, res) => {
  res.json(users);
});

// 根据ID查询用户
router.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: "用户不存在" });
  }
  res.json(user);
});

module.exports = router;
