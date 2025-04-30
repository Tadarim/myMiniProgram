import { View, Text, Input, Button } from '@tarojs/components';
import { useRouter, navigateBack } from '@tarojs/taro';

import {
  Avatar,
  Cell,
  DatePicker,
  ActionSheet,
  TextArea,
  Cascader,
  CascaderOption,
  Toast
} from '@nutui/nutui-react-taro';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { fetchLocation, fetchBirthDayExtra } from '@/api';
import { authService } from '@/api/auth';
import NavigationBar from '@/components/navigationBar';
import { userAtom } from '@/store/user';
import { Gender, UserInfo } from '@/types/user';

import './index.less';

const EditProfile = () => {
  const router = useRouter();

  const [user, setUser] = useAtom(userAtom);

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar);
  const [username, setUsername] = useState(user?.username);
  const [description, setDescription] = useState(user?.desc);
  const [gender, setGender] = useState<Gender | undefined>(user?.extra?.gender);
  const [birthdayDesc, setBirthdayDesc] = useState({
    birthday: user?.extra?.birthday,
    age: user?.extra?.age,
    constellation: user?.extra?.constellation
  });

  const [location, setLocation] = useState(['']);
  const [locationOptions, setLocationOptions] = useState(['陕西', '西安']);

  const [school, setSchool] = useState(user?.extra?.school);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const genderOptions = [
    { name: '男', value: Gender.Male as unknown as string },
    { name: '女', value: Gender.Female as unknown as string },
    { name: '保密', value: Gender.Unknown as unknown as string }
  ];

  const transformData = (data) => {
    return data.map((province) => ({
      value: province.name,
      text: province.name,
      children: province.pchilds.map((city) => ({
        value: city.name,
        text: city.name
      }))
    }));
  };

  const handleSave = async () => {
    try {
      console.log('birthdayDesc', birthdayDesc);
      const updatedUserInfo: Partial<UserInfo> = {
        ...user,
        avatar: avatarUrl || '',
        username: username || '',
        desc: description || '',
        extra: {
          ...user?.extra,
          gender: gender || Gender.Unknown,
          location: location || [],
          school: school || '',
          birthday: birthdayDesc.birthday || '',
          age: birthdayDesc.age ? `${birthdayDesc.age}岁` : '',
          constellation: birthdayDesc.constellation || ''
        }
      };

      const { success, data } = await authService.updateUserInfo(
        updatedUserInfo
      );
      console.log('data', data);

      if (success) {
        setUser(data);
        Toast.show('toast-edit', {
          title: '保存成功',
          duration: 1000
        });
        setTimeout(() => {
          navigateBack();
        }, 1500);
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('Save profile failed:', error);
      Toast.show('toast-edit', {
        title: '保存失败，请重试',
        duration: 2000
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchLocation();
        response?.data?.data &&
          setLocationOptions(transformData(response?.data?.data));
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <View className='page-container edit-profile-page'>
      <NavigationBar
        title='编辑个人资料'
        showBack
        backIconColor='#333'
        useOpacity
      />

      <View className='avatar-container'>
        <Avatar size='100' src={avatarUrl} />
      </View>

      <Cell
        title='名字'
        description={
          <TextArea
            showCount
            autoSize
            maxLength={20}
            placeholder='请输入名字'
            value={username}
            onChange={(val) => setUsername(val)}
          />
        }
      />
      <Cell
        title='简介'
        description={
          <TextArea
            showCount
            maxLength={50}
            placeholder='请输入简介'
            value={description}
            onChange={(val) => setDescription(val)}
          />
        }
      />
      <Cell
        title='性别'
        description={
          gender === Gender.Unknown
            ? '保密'
            : gender === Gender.Male
            ? '男'
            : '女'
        }
        onClick={() => setShowGenderPicker(true)}
      />
      <Cell
        title='生日'
        description={
          <>
            {birthdayDesc.birthday}
            {birthdayDesc.birthday && (
              <Text style={{ marginLeft: '5px' }}>
                {`（${birthdayDesc.age}岁 · ${birthdayDesc.constellation}）`}
              </Text>
            )}
          </>
        }
        onClick={() => setShowDatePicker(true)}
      />
      <Cell
        title='学校'
        description={
          <Input
            className='input-right'
            placeholder='请输入学校'
            value={school}
            onInput={(e) => setSchool(e.detail.value)}
          />
        }
      />
      <Cell
        title='所在地'
        description={location?.join('·')}
        onClick={() => setShowLocationPicker(true)}
      />

      <DatePicker
        title='选择生日'
        visible={showDatePicker}
        type='date'
        startDate={new Date(1990, 0, 1)}
        endDate={new Date()}
        defaultValue={new Date()}
        onClose={() => setShowDatePicker(false)}
        onConfirm={async (options) => {
          const { age, constellation } = await fetchBirthDayExtra(
            options.map((option) => option.label).join('-')
          );
          setBirthdayDesc({
            birthday: options.map((option) => option.label).join('-'),
            age: age < 0 ? 0 : age,
            constellation
          });
          setShowDatePicker(false);
        }}
      />

      <Cascader
        visible={showLocationPicker}
        options={locationOptions as CascaderOption[]}
        value={location} // 传入当前值数组
        onChange={(list) => {
          setLocation(list as string[]); // value 是选中的值数组
          setShowLocationPicker(false);
        }}
        onClose={() => setShowLocationPicker(false)}
      />

      <ActionSheet
        visible={showGenderPicker}
        options={genderOptions}
        onSelect={(item) => {
          setGender(item.value as unknown as Gender);
          setShowGenderPicker(false);
        }}
        onCancel={() => setShowGenderPicker(false)}
        cancelText='取消'
      />

      <View style={{ padding: '10px 16px' }}>
        <Button type='primary' className='save-btn' onClick={handleSave}>
          保存
        </Button>
      </View>
    </View>
  );
};

export default EditProfile;
