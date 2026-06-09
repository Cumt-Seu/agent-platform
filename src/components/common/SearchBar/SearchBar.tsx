// 搜索栏组件

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type React from 'react';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  style?: React.CSSProperties;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  value,
  onChange,
  onSearch,
  style,
}) => {
  return (
    <Input
      prefix={<SearchOutlined style={{ color: '#8C8C8C' }} />}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
      allowClear
      style={{ borderRadius: 6, ...style }}
    />
  );
};

export default SearchBar;
