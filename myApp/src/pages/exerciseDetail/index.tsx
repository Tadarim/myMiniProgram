import {
  View,
  Text,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup
} from '@tarojs/components';
import Taro, { showToast, useRouter } from '@tarojs/taro';

import { Star, StarFill } from '@nutui/icons-react-taro';
import React, { useState, useEffect } from 'react';

import NavigationBar from '@/components/NavigationBar'; // 确保引入 NavigationBar
import './index.less';

const questions = [
  {
    id: 1,
    type: '单选',
    content:
      '人们常常把软件工程的方法（开发方法）、工具（支持方法的工具）、（）称为软件工程三要素。',
    options: [
      { value: 'A', label: '程序' },
      { value: 'B', label: '质量' },
      { value: 'C', label: '人员' },
      { value: 'D', label: '过程' }
    ]
  },
  {
    id: 2,
    type: '多选',
    content: '以下哪些是软件工程的主要特点？',
    options: [
      { value: 'A', label: '过程化' },
      { value: 'B', label: '工程化' },
      { value: 'C', label: '规范化' },
      { value: 'D', label: '文档化' }
    ]
  },
  {
    id: 3,
    type: '单选',
    content:
      '软件生命周期包括可行性分析与项目开发计划、需求分析、（）、概要设计、详细设计、编码、测试和维护等阶段。',
    options: [
      { value: 'A', label: '系统设计' },
      { value: 'B', label: '系统分析' },
      { value: 'C', label: '系统实现' },
      { value: 'D', label: '系统测试' }
    ]
  },
  {
    id: 4,
    type: '多选',
    content: '软件测试的目的包括以下哪些？',
    options: [
      { value: 'A', label: '发现软件错误' },
      { value: 'B', label: '证明软件正确' },
      { value: 'C', label: '评估软件质量' },
      { value: 'D', label: '预防软件缺陷' }
    ]
  }
];

// 在组件中使用
const ExerciseDetail: React.FC = () => {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[][]>(
    Array(questions.length).fill([])
  );
  // 新增：收藏状态
  const [isCollected, setIsCollected] = useState(false); // 初始为未收藏

  // 修改 handleSingleSelect 来接收 value 参数，并处理点击逻辑
  const handleSingleSelect = (value: string) => {
    // 检查点击的是否是当前已选中的选项
    if (selectedAnswer.length > 0 && selectedAnswer[0] === value) {
      // 如果是，则清空选项（取消选择）
      setSelectedAnswer([]);
    } else {
      // 如果不是，则选中新选项
      setSelectedAnswer([value]);
    }
  };

  const handleMultiSelect = (e) => {
    setSelectedAnswer(e.detail.value);
  };

  const handleNext = () => {
    // 保存当前答案 (即使未选择也保存空数组)
    const newAnswers = [...answers];
    newAnswers[currentIndex - 1] = selectedAnswer;
    setAnswers(newAnswers);

    // 检查是否选择了答案 (可以在这里提示)
    if (!selectedAnswer.length && currentIndex < totalQuestions) {
      showToast({ title: '请选择答案', icon: 'none' });
      return;
    }

    if (currentIndex < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      // 切换到下一题时，加载该题已保存的答案
      // 注意：因为 setCurrentIndex 是异步的，直接用 currentIndex + 1 获取下一题索引
      setSelectedAnswer(newAnswers[currentIndex] || []);
    } else {
      // 在提交前确保最后一题答案已保存
      handleSubmit(newAnswers); // 传递最新的答案数组
    }
  };

  // 新增：处理上一题
  const handlePrev = () => {
    if (currentIndex > 1) {
      // 保存当前题目的答案（可选，但推荐，以防用户来回切换未保存）
      const newAnswers = [...answers];
      newAnswers[currentIndex - 1] = selectedAnswer;
      setAnswers(newAnswers);

      // 切换到上一题
      setCurrentIndex((prev) => prev - 1);
      // 加载上一题已保存的答案
      // 注意：因为 setCurrentIndex 是异步的，直接用 currentIndex - 1 获取上一题索引
      setSelectedAnswer(newAnswers[currentIndex - 2] || []);
    }
  };

  // 修改 handleSubmit 接收答案数组
  const handleSubmit = (finalAnswers: string[][]) => {
    // 不再需要从 state 读取最后一题答案，因为已在 handleNext 中保存
    // const finalAnswers = [...answers];
    // finalAnswers[currentIndex - 1] = selectedAnswer;
    console.log('提交答案:', finalAnswers);
    // TODO: 调用提交接口
  };

  // 每次切换题目时，加载已保存的答案 (这个 useEffect 可以保留，作为后备)
  useEffect(() => {
    setSelectedAnswer(answers[currentIndex - 1] || []);
  }, [currentIndex, answers]); // 添加 answers 依赖

  // 新增：收藏按钮点击处理
  const handleCollectToggle = () => {
    const newCollectStatus = !isCollected;
    setIsCollected(newCollectStatus);

    showToast({
      title: newCollectStatus ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });
    // TODO: 调用 API 更新收藏状态 (可能需要传递练习题集的 ID)
    console.log('练习题集收藏状态:', newCollectStatus);
  };

  const currentQuestion = questions[currentIndex - 1];
  const totalQuestions = questions.length;

  return (
    <View className='exercise-detail'>
      <NavigationBar title='答题' />

      <View className='question-header'>
        <View className='question-type'>{currentQuestion.type}</View>
        <View className='question-text'>{currentQuestion.content}</View>
      </View>

      <View className='options-list'>
        {currentQuestion.type === '单选' ? (
          <RadioGroup>
            {currentQuestion.options.map((option) => (
              <View
                key={option.value}
                className='option-wrapper'
                onClick={() => handleSingleSelect(option.value)}
              >
                <Radio
                  value={option.value}
                  checked={selectedAnswer.includes(option.value)}
                  className='option-item'
                >
                  <View className='option-content'>
                    <Text className='option-label'>{option.value}</Text>
                    <Text className='option-text'>{option.label}</Text>
                  </View>
                </Radio>
              </View>
            ))}
          </RadioGroup>
        ) : (
          // 多选部分保持不变
          <CheckboxGroup onChange={handleMultiSelect}>
            {currentQuestion.options.map((option) => (
              <View key={option.value} className='option-wrapper'>
                <Checkbox
                  value={option.value}
                  checked={selectedAnswer.includes(option.value)}
                  className='option-item'
                >
                  <View className='option-content'>
                    <Text className='option-label'>{option.value}</Text>
                    <Text className='option-text'>{option.label}</Text>
                  </View>
                </Checkbox>
              </View>
            ))}
          </CheckboxGroup>
        )}
      </View>

      <View className='question-footer'>
        {/* 进度点保持在上方 */}
        <View className='progress-dots'>
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <Text
              key={index}
              className={`dot ${index + 1 === currentIndex ? 'active' : ''}`}
            >
              {index + 1}
            </Text>
          ))}
        </View>
        <View className='footer-buttons'>
          <View className='collect-button-footer' onClick={handleCollectToggle}>
            {isCollected ? (
              <StarFill color='gold' size={18} />
            ) : (
              <Star color='#666' size={18} />
            )}
            <Text className='collect-text'>
              {isCollected ? '已收藏' : '收藏'}
            </Text>
          </View>

          {currentIndex > 1 && (
            <View className='prev-button' onClick={handlePrev}>
              <Text>上一题</Text>
            </View>
          )}
          <View className='next-button' onClick={handleNext}>
            <Text>{currentIndex === totalQuestions ? '提交' : '下一题'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ExerciseDetail;
