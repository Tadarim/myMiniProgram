module.exports = {
  "extends": ["taro/react"],
  "plugins": ["import"],
  "rules": {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "import/first": "off",
    "import/order": [
      "error",
      {
        // 配置规则
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true,
        },
      },
    ],
  },
}
