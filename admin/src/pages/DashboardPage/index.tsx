import React from "react";
import { Row, Col, Card, Typography } from "antd";
import { Column, Pie, Bar } from "@ant-design/plots"; // 引入需要的图表类型

const { Title } = Typography;

// --- 模拟数据 (后续需要替换为真实 API 数据) ---

// 1. 各课程选课情况 (示例)
const courseEnrollmentData = [
  { courseName: "高等数学", count: 150 },
  { courseName: "计算机基础", count: 200 },
  { courseName: "英语写作", count: 120 },
  { courseName: "线性代数", count: 80 },
  { courseName: "数据结构", count: 180 },
];

// 2. 课程完成情况 (示例 - 假设完成/未完成比例)
const courseCompletionData = [
  { type: "已完成", value: 275 },
  { type: "进行中", value: 450 },
  { type: "未开始", value: 105 },
];

// 3. 课程热门排行 (示例 - 按选课人数)
const coursePopularityData = [...courseEnrollmentData]
  .sort((a, b) => b.count - a.count)
  .slice(0, 5); // 取前5

// 4. 习题完成情况 (示例 - 按正确率或完成数)
const exerciseCompletionData = [
  { type: "高正确率 (>=80%)", value: 300 },
  { type: "中正确率 (60-80%)", value: 500 },
  { type: "低正确率 (<60%)", value: 150 },
  { type: "未完成", value: 200 },
];

// 5. 习题热门排行 (示例 - 按练习次数)
const exercisePopularityData = [
  { exerciseName: "React 基础测试", count: 500 },
  { exerciseName: "Vue 生命周期", count: 450 },
  { exerciseName: "JS 异步编程", count: 420 },
  { exerciseName: "CSS 布局挑战", count: 380 },
  { exerciseName: "算法入门-排序", count: 350 },
].sort((a, b) => b.count - a.count);

// --- 图表配置 ---

const enrollmentConfig = {
  data: courseEnrollmentData,
  xField: "courseName",
  yField: "count",
  label: { position: "middle", style: { fill: "#FFFFFF", opacity: 0.6 } },
  xAxis: { label: { autoHide: true, autoRotate: false } },
  meta: { courseName: { alias: "课程名称" }, count: { alias: "选课人数" } },
  height: 250,
};

const completionConfig = {
  appendPadding: 10,
  data: courseCompletionData,
  angleField: "value",
  colorField: "type",
  radius: 0.8,
  label: {
    type: "inner",
    offset: "-30%",
    content: "{value}",
    style: { fontSize: 14, textAlign: "center" },
  },
  interactions: [{ type: "element-active" }],
  legend: { position: "right" },
  meta: { type: { alias: "完成状态" }, value: { alias: "人数/比例" } },
  height: 250,
};

const coursePopularityConfig = {
  data: coursePopularityData,
  xField: "count",
  yField: "courseName",
  seriesField: "courseName",
  legend: { position: "top-left" },
  meta: { courseName: { alias: "课程名称" }, count: { alias: "选课人数" } },
  height: 250,
};

const exerciseCompletionConfig = {
  appendPadding: 10,
  data: exerciseCompletionData,
  angleField: "value",
  colorField: "type",
  radius: 0.8,
  label: {
    type: "inner",
    offset: "-30%",
    content: "{value}",
    style: { fontSize: 14, textAlign: "center" },
  },
  interactions: [{ type: "element-active" }],
  legend: { position: "right" },
  meta: { type: { alias: "完成情况" }, value: { alias: "人数/比例" } },
  height: 250,
};

const exercisePopularityConfig = {
  data: exercisePopularityData,
  xField: "count",
  yField: "exerciseName",
  seriesField: "exerciseName",
  legend: { position: "top-left" },
  meta: { exerciseName: { alias: "习题名称" }, count: { alias: "练习次数" } },
  height: 250,
};

// --- Dashboard 组件 ---
const DashboardPage: React.FC = () => {
  return (
    <div>
      <Title level={3} style={{ marginBottom: "20px" }}>
        数据概览
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card title="各课程学习情况">
            <Column {...enrollmentConfig} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card title="课程完成情况">
            <Pie {...completionConfig} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card title="课程热门排行 (Top 5)">
            <Bar {...coursePopularityConfig} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card title="习题完成情况">
            <Pie {...exerciseCompletionConfig} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={8}>
          <Card title="习题热门排行 (Top 5)">
            <Bar {...exercisePopularityConfig} />
          </Card>
        </Col>
        {/* 可以添加更多图表或数据卡片 */}
      </Row>
    </div>
  );
};

export default DashboardPage;
