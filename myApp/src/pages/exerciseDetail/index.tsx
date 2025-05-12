import {
  View,
  Text,
  Checkbox,
  Radio,
  CheckboxGroup,
  RadioGroup
} from '@tarojs/components';
import { showToast, useRouter } from '@tarojs/taro';

import { Star, StarFill, Success } from '@nutui/icons-react-taro';
import { Dialog } from '@nutui/nutui-react-taro';
import React, { useState, useEffect } from 'react';

import { exerciseService } from '@/api/exercise';
import { addHistory } from '@/api/history';
import RecommendModal from '@/components/modal';
import NavigationBar from '@/components/navigationBar';
import { Question } from '@/types/exercise';

import './index.less';

const typeMap = {
  single: '单选',
  multiple: '多选'
};

const ExerciseDetail: React.FC = () => {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[][]>([[]]);
  const [correctAnswers, setCorrectAnswers] = useState<string[][]>([]);
  const [isCollected, setIsCollected] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showRecommendModal, setShowRecommendModal] = useState(false);

  const fetchExerciseDetail = async () => {
    try {
      const res = await exerciseService.getExerciseDetail(
        router.params.id ?? ''
      );
      setQuestions(res.data.questions);
      setCorrectAnswers(res.data.questions.map((item) => item.answer));
      setIsCollected(res.data.is_collected);
    } catch (error) {
      console.error('获取习题详情失败:', error);
    }
  };

  useEffect(() => {
    fetchExerciseDetail();
    if (router.params.id) {
      addHistory(router.params.id, 'exercise');
    }
  }, [router]);

  const handleSingleSelect = (e) => {
    const value = e.detail.value;
    setSelectedAnswer([value]);
  };

  const handleMultiSelect = (e) => {
    setSelectedAnswer(e.detail.value);
  };

  const getScore = (answer: string[][], correctAnswer: string[][]) => {
    let correctNum = 0;

    if (answer.length !== correctAnswer.length) return 0;

    for (let i = 0; i < answer.length; i++) {
      if (answer[i].sort().join('') === correctAnswer[i].sort().join('')) {
        correctNum++;
      }
    }

    return Number((correctNum / answer.length).toFixed(1)) * 100;
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
      if (showAnswer) return;

      if (!selectedAnswer.length) {
        showToast({ title: '请选择答案', icon: 'none' });
        return;
      }

      exerciseService.updateCompleteCount(router.params.id ?? '');
      setShowModal(true);
      setScore(getScore(newAnswers, correctAnswers));
    }
  };

  const handlePrev = () => {
    const newAnswers = [...answers];

    setCurrentIndex((prev) => prev - 1);
    setSelectedAnswer(newAnswers[currentIndex - 2] || []);
  };

  const handleModalConfirm = () => {
    setShowAnswer(true);
    setShowModal(false);
    setCurrentIndex(1);
    setShowRecommendModal(true);
  };

  useEffect(() => {
    setSelectedAnswer(answers[currentIndex - 1] || []);
  }, [currentIndex, answers]);

  const handleCollectToggle = async () => {
    try {
      const response = await exerciseService.toggleExerciseCollection(
        router.params.id ?? ''
      );

      if (response.code === 200) {
        setIsCollected(response.data.is_collected);
        showToast({
          title:
            response.message ||
            (response.data.is_collected ? '收藏成功' : '取消收藏'),
          icon: 'success',
          duration: 1500
        });
      } else {
        showToast({
          title: response.message || '操作失败',
          icon: 'none',
          duration: 1500
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      showToast({
        title: '操作失败',
        icon: 'none',
        duration: 1500
      });
    }
  };

  const currentQuestion = questions[currentIndex - 1];
  const totalQuestions = questions.length;

  return (
    <View className='exercise-detail'>
      <NavigationBar title='答题' />

      <View className='question-header'>
        <View className='question-type'>{typeMap[currentQuestion?.type]}</View>
        <View className='question-text'>{currentQuestion?.content}</View>
      </View>

      <View className='options-list'>
        {currentQuestion?.type === 'single' ? (
          <RadioGroup className='radio-group'>
            {currentQuestion?.options.map((option, index) => (
              <View
                key={option}
                className='option-wrapper'
                onClick={() => {
                  if (!showAnswer) {
                    setSelectedAnswer([option]);
                  }
                }}
              >
                <View className='option-inner'>
                  <Radio
                    value={option}
                    checked={selectedAnswer.includes(option)}
                    disabled={showAnswer}
                    className='radio-item'
                  />
                  <View className='option-content'>
                    <Text className='option-label'>
                      {String.fromCharCode(index + 65)}
                    </Text>
                    <Text className='option-text'>{option}</Text>
                  </View>
                </View>
              </View>
            ))}
          </RadioGroup>
        ) : (
          <CheckboxGroup className='checkbox-group'>
            {currentQuestion?.options.map((option, index) => (
              <View
                key={option}
                className='option-wrapper'
                onClick={() => {
                  if (!showAnswer) {
                    const newSelected = [...selectedAnswer];
                    const newIndex = newSelected.indexOf(option);
                    if (newIndex > -1) {
                      newSelected.splice(newIndex, 1);
                    } else {
                      newSelected.push(option);
                    }
                    setSelectedAnswer(newSelected);
                  }
                }}
              >
                <View className='option-inner'>
                  <Checkbox
                    value={option}
                    checked={
                      showAnswer
                        ? answers.flat(1).includes(option)
                        : selectedAnswer.includes(option)
                    }
                    disabled={showAnswer}
                    className='checkbox-item'
                  />
                  <View className='option-content'>
                    <Text className='option-label'>
                      {String.fromCharCode(index + 65)}
                    </Text>
                    <Text className='option-text'>{option}</Text>
                  </View>
                </View>
              </View>
            ))}
          </CheckboxGroup>
        )}
      </View>
      {showAnswer && (
        <View className='correct-answer'>
          正确答案：
          <Text className='answer'>
            {correctAnswers[currentIndex - 1].join(' ,')}
          </Text>{' '}
        </View>
      )}

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

      <Dialog
        id='dialog'
        title='提交成功'
        visible={showModal}
        confirmText='查看答案'
        onConfirm={handleModalConfirm}
        onCancel={() => setShowModal(false)}
        closeOnOverlayClick
      >
        <View className='dialog-content'>
          <Success size={40} style={{ margin: '16px 0' }} />
          <Text style={{ marginBottom: '16px' }}>分数: {score}</Text>
        </View>
      </Dialog>

      <RecommendModal
        visible={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        triggerType='exercise'
      />
    </View>
  );
};

export default ExerciseDetail;
