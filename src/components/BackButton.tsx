import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface BackButtonProps {
  to?: string; // 可选的指定返回路径
  style?: React.CSSProperties;
}

const BackButton: React.FC<BackButtonProps> = ({ to, style }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const business = searchParams.get('business') || 'next';

  const handleBack = () => {
    if (to) {
      // 如果指定了返回路径，直接跳转
      navigate(to);
    } else {
      // 否则使用浏览器的返回功能
      navigate(-1);
    }
  };

  return (
    <Button
      type="text"
      icon={<ArrowLeftOutlined />}
      onClick={handleBack}
      style={{
        marginBottom: 16,
        fontSize: 14,
        ...style,
      }}
    >
      返回上一级
    </Button>
  );
};

export default BackButton;
