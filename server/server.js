const express = require("express");
const cors = require("cors");
const userService = require("./service/userService");
const authService = require("./service/authService");

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 中间件
app.use(express.json());

app.use("/api", userService);
app.use("/api/auth", authService);

// 根路由
app.get("/", (req, res) => {
  res.send("welcome");
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "服务器错误" });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
