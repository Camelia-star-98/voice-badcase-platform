import React, { useState, useRef, useEffect } from 'react';
import { Modal, Slider, Button, Space, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

interface AudioPlayerProps {
  visible: boolean;
  audioUrl: string;
  recordId: string;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ visible, audioUrl, recordId, onClose }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && audioUrl) {
      // 创建音频对象
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // 监听音频加载完成
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
        setLoading(false);
      });

      // 监听播放进度
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      // 监听播放结束
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
        message.info('音频播放完毕');
      });

      // 监听错误
      audio.addEventListener('error', (e) => {
        const urlPreview = audioUrl.startsWith('data:') 
          ? `Base64音频 (${Math.round(audioUrl.length / 1024)}KB)` 
          : audioUrl;
        console.error('音频加载错误:', e, '音频类型:', urlPreview);
        const errorMsg = audio.error?.code === 4 
          ? '音频文件不存在或无法访问' 
          : '音频文件加载失败，请检查文件格式或网络连接';
        message.error(errorMsg);
        setLoading(false);
      });

      return () => {
        // 清理音频对象
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
          audioRef.current = null;
        }
      };
    }
  }, [visible, audioUrl]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('播放失败:', error);
          message.error('音频播放失败');
        });
      }
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        });
      }
    }
  };

  const handleSliderChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    onClose();
  };

  return (
    <Modal
      title={`音频播放 - ${recordId}`}
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="close" onClick={handleClose}>
          关闭
        </Button>
      ]}
      width={500}
    >
      <div style={{ padding: '20px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            音频加载中...
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ textAlign: 'center' }}>
              <Space size="large">
                <Button
                  type="primary"
                  shape="circle"
                  icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  size="large"
                  onClick={handlePlayPause}
                />
                <Button
                  shape="circle"
                  icon={<ReloadOutlined />}
                  onClick={handleRestart}
                  title="重新播放"
                />
              </Space>
            </div>

            <div>
              <Slider
                min={0}
                max={duration}
                step={0.1}
                value={currentTime}
                onChange={handleSliderChange}
                tooltip={{ formatter: (value) => formatTime(value || 0) }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div style={{ 
              fontSize: '12px', 
              color: '#666', 
              textAlign: 'center',
              wordBreak: 'break-all'
            }}>
              {audioUrl.startsWith('data:') 
                ? `Base64 编码音频 (大小: ${Math.round(audioUrl.length / 1024)} KB)` 
                : audioUrl}
            </div>
          </Space>
        )}
      </div>
    </Modal>
  );
};

export default AudioPlayer;

