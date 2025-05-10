import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Statistic, Spin, message } from "antd";
import { Pie, Bar, Line } from "@ant-design/plots";
import { getDashboardOverview, DashboardData } from "@/api/dashboard";

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardOverview();
        if (res.code === 200) {
          setData(res.data);
        } else {
          message.error(res.message || "获取数据失败");
        }
      } catch (error) {
        message.error("获取数据失败，请检查网络连接");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return <Spin style={{ marginTop: 100 }} />;
  }

  // 1. 数字卡片
  const statCards = [
    { title: "课程总数", value: data.courseCount },
    { title: "习题集总数", value: data.exerciseCount },
    { title: "帖子总数", value: data.postCount },
    { title: "用户总数", value: data.userCount },
  ];

  // 2. 趋势折线图
  const trendConfig = (
    trendData: Array<{ date: string; count: number }>,
    name: string
  ) => ({
    data: trendData,
    xField: "date",
    yField: "count",
    seriesField: name,
    height: 220,
    point: { size: 4, shape: "diamond" },
    smooth: true,
    meta: { date: { alias: "日期" }, count: { alias: "数量" } },
  });

  // 3. 热门排行
  const barConfig = (list: any[], xField: string, yField: string) => ({
    data: list,
    xField,
    yField,
    seriesField: yField,
    legend: { position: "top-left" as const },
    height: 220,
    meta: { [xField]: { alias: "数量" }, [yField]: { alias: "名称" } },
  });

  // 4. 饼图
  const pieConfig = (list: any[], angleField: string, colorField: string) => ({
    appendPadding: 10,
    data: list,
    angleField,
    colorField,
    radius: 0.8,
    label: {
      type: "inner",
      offset: "-30%",
      content: "{value}",
      style: { fontSize: 14, textAlign: "center" },
    },
    interactions: [{ type: "element-active" }],
    legend: { position: "right" as const },
    height: 220,
  });

  return (
    <div>
      <Title level={3} style={{ marginBottom: "20px" }}>
        数据概览
      </Title>
      <Row gutter={[16, 16]}>
        {statCards.map((item) => (
          <Col xs={12} sm={6} md={6} lg={6} key={item.title}>
            <Card>
              <Statistic title={item.title} value={item.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="课程增长趋势">
            <Line {...trendConfig(data.courseTrend, "课程")} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="习题增长趋势">
            <Line {...trendConfig(data.exerciseTrend, "习题")} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="帖子增长趋势">
            <Line {...trendConfig(data.postTrend, "帖子")} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="课程热门排行">
            <Bar {...barConfig(data.courseHot, "count", "title")} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="习题热门排行">
            <Bar {...barConfig(data.exerciseHot, "count", "title")} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="帖子热门互动排行">
            <Bar {...barConfig(data.postHot, "count", "content")} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card title="课程收藏分布">
            <Pie {...pieConfig(data.courseCollect, "count", "title")} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="习题完成分布">
            <Pie {...pieConfig(data.exerciseComplete, "count", "title")} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="帖子互动分布">
            <Pie {...pieConfig(data.postInteract, "count", "content")} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="用户活跃度趋势">
            <Line {...trendConfig(data.userActiveTrend, "活跃用户")} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="收藏类型分布">
            <Pie {...pieConfig(data.favoriteTypeDist, "count", "type")} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card title="历史类型分布">
            <Pie {...pieConfig(data.historyTypeDist, "count", "type")} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
