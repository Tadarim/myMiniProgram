import {
  View,
  Text,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup
} from '@tarojs/components';
import { showToast, useRouter } from '@tarojs/taro';

import { Star, StarFill } from '@nutui/icons-react-taro';
import React, { useState, useEffect } from 'react';

import NavigationBar from '@/components/navigationBar';
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

const ExerciseDetail: React.FC = () => {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[][]>(
    Array(questions.length).fill([])
  );
  const [isCollected, setIsCollected] = useState(false);

  const handleSingleSelect = (value: string) => {
    if (selectedAnswer.length > 0 && selectedAnswer[0] === value) {
      setSelectedAnswer([]);
    } else {
      setSelectedAnswer([value]);
    }
  };

  const handleMultiSelect = (e) => {
    setSelectedAnswer(e.detail.value);
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex - 1] = selectedAnswer;
    setAnswers(newAnswers);

    if (!selectedAnswer.length && currentIndex < totalQuestions) {
      showToast({ title: '请选择答案', icon: 'none' });
      return;
    }

    if (currentIndex < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(newAnswers[currentIndex] || []);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 1) {
      const newAnswers = [...answers];
      newAnswers[currentIndex - 1] = selectedAnswer;
      setAnswers(newAnswers);

      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswer(newAnswers[currentIndex - 2] || []);
    }
  };

  const handleSubmit = (finalAnswers: string[][]) => {
    console.log('提交答案:', finalAnswers);
  };

  useEffect(() => {
    setSelectedAnswer(answers[currentIndex - 1] || []);
  }, [currentIndex, answers]);

  const handleCollectToggle = () => {
    const newCollectStatus = !isCollected;
    setIsCollected(newCollectStatus);

    showToast({
      title: newCollectStatus ? '收藏成功' : '取消收藏',
      icon: 'success',
      duration: 1500
    });
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
