import { Cell, Form, Input, Button, Field, Picker, Popup } from "@taroify/core"
import { useState } from "react"
import { View, Text } from "@tarojs/components"
import Taro from '@tarojs/taro'
import { useDispatch, useSelector } from "react-redux"

import TopNav from "../../components/Header/Header"
import { setId } from '../../store/idSlice'
import './Login.css'


const Login = () => {

    const { id } = useSelector(state => state)

    const dispatch = useDispatch()

    const [value, setValue] = useState({})

    const [openPicker, setOpenPicker] = useState(false)

    const [changePsd, setChangePsd] = useState(false)

    const changeHandler = (val, name) => {
        setValue(preVal => { return { ...preVal, [name]: val } })
    }

    const confirmHandler = (values) => {
        switch (values[0]) {
            case '学生':
                changeHandler(1, 'role')
                setChangePsd(true)
                break
            case '老师':
                changeHandler(2, 'role')
                setChangePsd(false)
                break
            case '管理员':
                changeHandler(3, 'role')
                setChangePsd(false)
                break
        }
        changeHandler(values[0], 'id')
        setOpenPicker(false)
    }

    const Navigater = () => {
        Taro.request(
            {
                url: 'http://192.168.133.30:8080/login',
                method: 'POST',
                header: {
                    'Content-type': 'application/json'
                },
                data:
                {
                    role: value.role,
                    username: value.username,
                    password: value.password
                },
                success: function (res2) {
                    console.log(res2.data)
                    if (res2.data.data) {
                        switch (value.id) {
                            case '学生':
                                Taro.setStorage({
                                    key: "stuData",
                                    data: res2.data.data,
                                    success: () => {
                                        console.log('学生存储成功');
                                    }
                                })
                                break;
                            case '老师':
                                Taro.setStorage({
                                    key: "tchData",
                                    data: res2.data.data,
                                    success: () => {
                                        console.log('老师存储成功');
                                    }
                                })
                                break;
                            case '管理员':
                                Taro.setStorage({
                                    key: "manData",
                                    data: res2.data.data,
                                    success: () => {
                                        console.log('管理员存储成功');
                                    }
                                })
                        }

                    }
                    Taro.showToast({
                        title: res2.data.msg,
                        icon: 'none'
                    })
                    if (res2.data.code === 200) {
                        Taro.switchTab({
                            url: '../index/index'
                        })
                    }
                }
            }
        )

        dispatch(setId(value.id))
    }

    const ChangePsd = () => {
        Taro.navigateTo(
            {
                url: '../ChangePsd/ChangePsd'
            }
        )
    }

    return (
        <TopNav value='登录'>
            <Field className='selector' label='身份' onClick={() => setOpenPicker(true)}>
                <Input readonly placeholder='选择身份' value={value.id} />
            </Field>
            <Popup open={openPicker} rounded placement='bottom' onClose={setOpenPicker}>
                <Popup.Backdrop />
                <Picker onCancel={() => setOpenPicker(false)} onConfirm={(values) => confirmHandler(values)} >
                    <Picker.Toolbar>
                        <Picker.Button>取消</Picker.Button>
                        <Picker.Title>标题</Picker.Title>
                        <Picker.Button>确认</Picker.Button>
                    </Picker.Toolbar>
                    <Picker.Column>
                        <Picker.Option>学生</Picker.Option>
                        <Picker.Option>老师</Picker.Option>
                        <Picker.Option>管理员</Picker.Option>
                    </Picker.Column>
                </Picker>
            </Popup>


            <Form>
                <Cell.Group inset>
                    <Form.Item name='username' rules={[{ required: true, message: "请填写账号" }]}>
                        <Form.Label>账号</Form.Label>
                        <Form.Control>
                            <Input placeholder='请输入账号' value={value.username} onChange={(e) => changeHandler(e.target.value, 'username')} />
                        </Form.Control>
                    </Form.Item>
                    <Form.Item name='password' rules={[{ required: true, message: "请填写密码" }]}>
                        <Form.Label>密码</Form.Label>
                        <Form.Control>
                            <Input password placeholder='请输入密码' value={value.password} onChange={(e) => changeHandler(e.target.value, 'password')} />
                        </Form.Control>
                    </Form.Item>
                </Cell.Group>

                <View style={{ margin: "16px" }}>
                    <Button shape='round' block color='primary' formType='submit' onClick={Navigater}>
                        登录
                    </Button>
                </View>
            </Form>
            {changePsd &&
                <View className='navigater-wrapper'>
                    <View className='navigater'>
                        <Text className='forgetPsd' onClick={ChangePsd}>忘记密码</Text>
                    </View>
                </View>}
        </TopNav>
    )
}

export default Login