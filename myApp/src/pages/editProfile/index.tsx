import { View, Text, Input, Button } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';

import {
  Avatar,
  Cell,
  DatePicker,
  ActionSheet,
  TextArea,
  Cascader,
  CascaderOption
} from '@nutui/nutui-react-taro';
import { useEffect, useState } from 'react';

import { fetchLocation, fetchBirthDayExtra } from '@/api';
import NavigationBar from '@/components/NavigationBar';
import './index.less';

const EditProfile = () => {
  const router = useRouter();

  // --- 状态管理 ---
  const [avatarUrl, setAvatarUrl] = useState(/* ... initial value ... */);
  const [bgImageUrl, setBgImageUrl] = useState(
    'https://via.placeholder.com/400x200?text=Background'
  );
  const [username, setUsername] = useState('用户不存在');
  const [description, setDescription] = useState('');
  const [gender, setGender] = useState('保密');
  const defaultBirthday = new Date();
  const [birthdayDesc, setBirthdayDesc] = useState({
    birthday: `${defaultBirthday.getFullYear()}-${
      defaultBirthday.getMonth() + 1
    }-${defaultBirthday.getDate()}`,
    age: 0,
    constellation: '金牛座'
  });

  const [location, setLocation] = useState(['陕西', '西安']); // 使用数组存储省市
  const [locationOptions, setLocationOptions] = useState(['陕西', '西安']); // 使用数组存储省市

  const [school, setSchool] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const genderOptions = [{ name: '男' }, { name: '女' }, { name: '保密' }];

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

  useEffect(() => {
    // 使用 async 函数来处理异步请求
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
        description={gender}
        onClick={() => setShowGenderPicker(true)}
      />
      <Cell
        title='生日'
        description={
          <>
            {birthdayDesc.birthday}
            <Text style={{ marginLeft: '5px' }}>
              {`（${birthdayDesc.age}岁 · ${birthdayDesc.constellation}）`}
            </Text>
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
        description={location.join('·')}
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

      {/* 所在地选择 */}
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

      {/* 性别选择 */}
      <ActionSheet
        visible={showGenderPicker}
        options={genderOptions}
        onSelect={(item) => {
          setGender(item.name as string);
          setShowGenderPicker(false);
        }}
        onCancel={() => setShowGenderPicker(false)}
        cancelText='取消'
      />

      {/* 可以添加保存按钮 */}
      <View style={{ padding: '10px 16px' }}>
        <Button
          type='primary'
          className='save-btn'
          /* onClick={handleSave} */
        >
          保存
        </Button>
      </View>
    </View>
  );
};

export default EditProfile;
