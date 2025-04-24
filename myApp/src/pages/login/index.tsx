import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';

import { Mail } from '@nutui/icons-react-taro';
import {
  Input,
  Button,
  Form,
  Toast,
  Cell,
  FormItem
} from '@nutui/nutui-react-taro';
import React, { useState, useEffect, useRef } from 'react';

import NavigationBar from '@/components/NavigationBar';

import './index.less';

type PageMode = 'login' | 'forgotPassword';

const LoginPage: React.FC = () => {
  const [loginForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<PageMode>('login');
  // 新增：验证码发送按钮状态
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // 用于存储定时器

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleLoginRegister = async (values) => {
    setLoading(true);
    console.log('Login/Register Form values:', values);
    const { account, password } = values;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Toast.show('toast-login', {
        type: 'success',
        title: '登录成功',
        duration: 1000
      });

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } catch (error) {
      console.error('Login/Register failed:', error);
      Toast.show('toast-login', {
        type: 'fail',
        title: '登录或注册失败，请重试',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  // 修改：发送验证码逻辑
  const handleSendVerificationCode = async () => {
    // 校验邮箱字段
    try {
      await forgotPasswordForm.validateFields(['email']); // 只校验 email
      const email = forgotPasswordForm.getFieldValue('email');
      console.log('Requesting verification code for:', email);

      if (email) {
        setCodeLoading(true); // 开始加载

        // --- 模拟发送验证码 API 调用 ---
        await new Promise((resolve) => setTimeout(resolve, 1000));

        Toast.show('toast-login', {
          type: 'success',
          title: '验证码已发送',
          duration: 1500
        });

        // 开始倒计时
        setCountdown(60);
        timerRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              timerRef.current = null;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (errorInfo) {
      // 校验失败或 API 调用失败
      console.error('Send code failed:', errorInfo);
      // 如果是校验失败，NutUI 会自动显示错误信息，这里可以只处理 API 错误
      if (!errorInfo.errorFields) {
        // 假设 API 错误不是校验错误格式
        Toast.show('toast-login', {
          type: 'fail',
          title: '验证码发送失败',
          duration: 2000
        });
      }
    } finally {
      setCodeLoading(false); // 结束加载
    }
  };

  const handleResetPasswordSubmit = async (values) => {
    setLoading(true); // 主按钮 loading
    const { email, verificationCode, newPassword } = values;
    console.log(
      'Resetting password for:',
      email,
      'with code:',
      verificationCode
    );

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 模拟网络请求

      Toast.show('toast-login', {
        type: 'success',
        title: '密码重置成功',
        duration: 1000
      });

      setTimeout(() => {
        setMode('login');
      }, 1500);
    } catch (error) {
      console.error('Password reset failed:', error);
      Toast.show('toast-login', {
        type: 'fail',
        title: '密码重置失败，请重试', // 可能验证码错误或超时
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  // 微信登录处理函数
  const handleWeChatLogin = async () => {
    setLoading(true); // 可以考虑为微信登录设置独立的 loading 状态
    try {
      // --- 在这里实现调用微信登录 API 的逻辑 ---
      // 例如：Taro.login(), 然后将 code 发送到后端换取用户信息和 token
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 模拟异步操作

      Toast.show('toast-login', {
        type: 'success',
        title: '微信登录成功',
        duration: 1000
      });

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/index/index' });
      }, 1500);
    } catch (error) {
      console.error('WeChat Login failed:', error);
      Toast.show('toast-login', {
        type: 'fail',
        title: '微信登录失败，请重试',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordLinkClick = () => setMode('forgotPassword');
  const handleBackToLoginClick = () => setMode('login');

  useEffect(() => {
    if (mode === 'login') {
      forgotPasswordForm.resetFields();
    } else {
      loginForm.resetFields();
    }
    // 切换模式时清除倒计时
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(0);
    setCodeLoading(false);
    setLoading(false);
  }, [mode, loginForm, forgotPasswordForm]);

  return (
    <View className='login-page page-container'>
      <NavigationBar
        title={mode === 'login' ? '登录 / 注册' : '找回密码'}
        showBack={false}
      />
      <Toast id='toast-login' />

      <View className='login-form-container'>
        <Text className='welcome-title'>
          {mode === 'login' ? '欢迎回来!' : '找回您的密码'}
        </Text>

        {/* 登录模式表单 (保持不变) */}
        {mode === 'login' && (
          <Form
            form={loginForm}
            onFinish={handleLoginRegister}
            footer={
              <Button
                nativeType='submit'
                type='primary'
                block
                loading={loading}
                className='login-button'
              >
                登录 / 注册
              </Button>
            }
          >
            <View className='input-with-icon'>
              <Mail className='input-icon' />
              <FormItem
                name='account'
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱格式' }
                ]}
              >
                <Input className='input-field' placeholder='邮箱' />
              </FormItem>
            </View>

            <View className='input-with-icon'>
              <Image
                src='https://img20.360buyimg.com/openfeedback/jfs/t1/276941/4/26814/887/6808e5a0F4ab9a8f8/724a6a494e574979.png'
                className='input-img-icon'
              />

              <FormItem
                name='password'
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少需要6位' }
                ]}
              >
                <Input
                  className='input-field'
                  type='password'
                  placeholder='密码'
                />
              </FormItem>
            </View>
          </Form>
        )}

        {/* 找回密码模式表单 (修正结构) */}
        {mode === 'forgotPassword' && (
          <Form
            form={forgotPasswordForm}
            onFinish={handleResetPasswordSubmit}
            footer={
              <Button
                nativeType='submit'
                type='primary'
                block
                loading={loading} // 使用主 loading 状态
                className='login-button' // 复用样式
              >
                重置密码 {/* 修改按钮文字 */}
              </Button>
            }
          >
            {/* 邮箱输入框 (恢复为普通带图标样式) */}

            {/* 使用 input-with-icon */}
            <View className='input-with-icon'>
              <Mail className='input-icon' />
              <FormItem
                name='email'
                rules={[
                  { required: true, message: '请输入注册邮箱' },
                  { type: 'email', message: '请输入有效的邮箱格式' }
                ]}
              >
                <Input className='input-field' placeholder='注册邮箱地址' />
              </FormItem>
            </View>

            {/* 使用 input-with-button */}
            <View className='input-with-button'>
              <FormItem
                name='verificationCode'
                rules={[
                  { required: true, message: '请输入邮箱验证码' },
                  { max: 6, message: '验证码最多6位' }
                ]}
              >
                <Input
                  className='input-field verification-code-input' // 这个类名可能不再需要特别处理宽度，flex:1 即可
                  placeholder='邮箱验证码'
                />
              </FormItem>
              <Button
                className='send-code-button'
                size='small'
                type='primary'
                fill='none'
                onClick={handleSendVerificationCode}
                loading={codeLoading}
                disabled={countdown > 0 || codeLoading}
              >
                {countdown > 0 ? `${countdown}s 后重发` : '发送验证码'}
              </Button>
            </View>

            <View className='input-with-icon'>
              <Image
                src='https://img20.360buyimg.com/openfeedback/jfs/t1/276941/4/26814/887/6808e5a0F4ab9a8f8/724a6a494e574979.png'
                className='input-img-icon'
              />
              <FormItem
                name='newPassword'
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少需要6位' }
                ]}
              >
                <Input
                  className='input-field'
                  type='password'
                  placeholder='新密码'
                />
              </FormItem>
            </View>

            <View className='input-with-icon'>
              <Image
                src='https://img20.360buyimg.com/openfeedback/jfs/t1/276941/4/26814/887/6808e5a0F4ab9a8f8/724a6a494e574979.png'
                className='input-img-icon'
              />
              <FormItem
                name='confirmPassword'
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  {
                    validator: (rule, value) =>
                      value === forgotPasswordForm.getFieldValue('newPassword'),
                    message: '两次输入的密码不一致'
                  }
                ]}
                dependencies={['newPassword']} // 声明依赖 newPassword 字段
              >
                <Input
                  className='input-field'
                  type='password'
                  placeholder='确认新密码'
                />
              </FormItem>
            </View>
          </Form>
        )}

        <View className='extra-links'>
          {mode === 'login' ? (
            <Text className='link-text' onClick={handleForgotPasswordLinkClick}>
              忘记密码?
            </Text>
          ) : (
            <Text className='link-text' onClick={handleBackToLoginClick}>
              返回登录
            </Text>
          )}
        </View>

        {mode === 'login' && (
          <>
            <Cell.Group>
              <Cell title='其他登录方式' />
            </Cell.Group>
            <View className='social-login'>
              <Button
                fill='none'
                className='social-button wechat-button'
                onClick={handleWeChatLogin}
                icon={
                  <Image
                    src='https://img20.360buyimg.com/openfeedback/jfs/t1/277779/20/26848/1044/6808e575F5957b6de/0e014e2904fe4ef9.png'
                    className='input-img-icon'
                  />
                }
              >
                微信登录
              </Button>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default LoginPage;
