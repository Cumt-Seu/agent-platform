// FileUploader — Ant Design Upload 封装

import { Upload, type UploadFile } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

interface FileUploaderProps {
  accept?: string;
  maxCount?: number;
  maxSize?: number; // bytes
  onUpload?: (file: File) => void;
  onRemove?: (file: File) => void;
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  accept,
  maxCount = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  onUpload,
  onRemove,
  value,
  onChange,
}) => {
  const handleChange = (info: { fileList: UploadFile[] }) => {
    onChange?.(info.fileList);
  };

  return (
    <Dragger
      accept={accept}
      maxCount={maxCount}
      fileList={value}
      onChange={handleChange}
      beforeUpload={(file) => {
        if (file.size > maxSize) {
          return Upload.LIST_IGNORE;
        }
        onUpload?.(file);
        return false; // 阻止自动上传
      }}
      onRemove={(file) => {
        onRemove?.(file as unknown as File);
        return true;
      }}
    >
      <p style={{ marginBottom: 8 }}>
        <InboxOutlined style={{ color: '#1677FF', fontSize: 32 }} />
      </p>
      <p style={{ margin: 0, fontSize: 14 }}>点击或拖拽文件到此区域上传</p>
      <p style={{ margin: '4px 0 0', color: '#8C8C8C', fontSize: 12 }}>
        最大 {maxSize / 1024 / 1024}MB，最多 {maxCount} 个文件
      </p>
    </Dragger>
  );
};

export default FileUploader;
