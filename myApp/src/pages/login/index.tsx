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
import { useSetAtom } from 'jotai';
import React, { useState, useEffect, useRef } from 'react';

import { authService } from '@/api/auth';
import NavigationBar from '@/components/navigationBar';
import { userAtom } from '@/store/user';

import './index.less';

type PageMode = 'login' | 'forgotPassword';

const LoginPage: React.FC = () => {
  const [loginForm] = Form.useForm();
  const [forgotPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<PageMode>('login');
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const setUserInfo = useSetAtom(userAtom);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const showToast = (title: string) => {
    if (toastVisible) return;
    setToastVisible(true);
    Toast.show('toast-login', {
      title,
      onClose: () => {
        setToastVisible(false);
      }
    });
  };

  const handleLoginRegister = async (values) => {
    setLoading(true);
    const { account, password } = values;

    try {
      const { data, success } = await authService.loginWithEmail(
        account,
        password
      );

      if (success) {
        Taro.setStorageSync('token', data.token);
        Taro.setStorageSync('userInfo', data.user);
        setUserInfo(data.user);

        showToast('登录成功');

        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' });
        }, 1500);
      } else {
        throw new Error('登录失败');
      }
    } catch (error) {
      console.error('Login/Register failed:', error);
      showToast('登录或注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      await forgotPasswordForm.validateFields(['email']);
      const email = forgotPasswordForm.getFieldValue('email');

      if (email) {
        setCodeLoading(true);
        const response = await authService.sendVerificationCode(email);

        if (response.success) {
          showToast('验证码已发送');

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
      }
    } catch (errorInfo) {
      console.error('Send code failed:', errorInfo);
      if (!errorInfo.errorFields) {
        showToast('验证码发送失败');
      }
    } finally {
      setCodeLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (values) => {
    setLoading(true);
    const { email, verificationCode, newPassword } = values;

    try {
      const response = await authService.resetPassword(
        email,
        verificationCode,
        newPassword
      );

      if (response.success) {
        showToast('密码重置成功');

        setTimeout(() => {
          setMode('login');
        }, 1500);
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      showToast('密码重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleWeChatLogin = async () => {
    setLoading(true);
    try {
      const { code } = await Taro.login();
      const { data, success } = await authService.loginWithWeChat(code);

      if (success) {
        Taro.setStorageSync('token', data.token);
        Taro.setStorageSync('userInfo', data.user);
        setUserInfo(data.user);

        showToast('微信登录成功');

        setTimeout(() => {
          Taro.switchTab({ url: '/pages/index/index' });
        }, 1500);
      } else {
        throw new Error('微信登录失败');
      }
    } catch (error) {
      console.error('WeChat Login failed:', error);
      showToast('微信登录失败，请重试');
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
          {mode === 'login' ? '欢迎回来!' : '找回密码'}
        </Text>

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

        {mode === 'forgotPassword' && (
          <Form
            form={forgotPasswordForm}
            onFinish={handleResetPasswordSubmit}
            footer={
              <Button
                nativeType='submit'
                type='primary'
                block
                loading={loading}
                className='login-button'
              >
                重置密码
              </Button>
            }
          >
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

            <View className='input-with-button'>
              <FormItem
                name='verificationCode'
                rules={[
                  { required: true, message: '请输入邮箱验证码' },
                  { max: 6, message: '验证码最多6位' }
                ]}
              >
                <Input
                  className='input-field verification-code-input'
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
