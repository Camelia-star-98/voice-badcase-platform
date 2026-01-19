import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BadcaseData } from '../types';
import { mockBadcaseList } from '../api/mockData';
import * as badcaseApi from '../api/badcaseApi';
import { supabase } from '../api/supabase';

interface BadcaseContextType {
  badcaseList: BadcaseData[];
  addBadcase: (badcase: BadcaseData) => Promise<void>;
  updateBadcase: (id: string, updates: Partial<BadcaseData>) => Promise<void>;
  deleteBadcase: (id: string) => Promise<void>;
  refreshList: () => Promise<void>;
  loading: boolean;
  useSupabase: boolean;
}

const BadcaseContext = createContext<BadcaseContextType | undefined>(undefined);

export const BadcaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badcaseList, setBadcaseList] = useState<BadcaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [useSupabase, setUseSupabase] = useState(false);

  // 初始化：检查 Supabase 连接并加载数据
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // 检查 Supabase 是否可用
        const isConnected = await badcaseApi.checkConnection();
        setUseSupabase(isConnected);

        if (isConnected) {
          console.log('🌐 使用 Supabase 数据库');
          // 从 Supabase 加载数据
          const data = await badcaseApi.getAllBadcases();
          setBadcaseList(data);
          console.log(`✅ 从 Supabase 加载了 ${data.length} 条数据`);
        } else {
          console.log('💾 使用本地 localStorage');
          // 使用 localStorage
          const savedData = localStorage.getItem('badcaseList');
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setBadcaseList(parsed);
              console.log(`✅ 从 localStorage 加载了 ${parsed.length} 条数据`);
            } catch (e) {
              console.error('❌ 解析 localStorage 数据失败:', e);
              setBadcaseList(mockBadcaseList);
            }
          } else {
            // 如果 localStorage 为空，使用 mock 数据
            setBadcaseList(mockBadcaseList);
            console.log(`✅ 使用 Mock 数据，共 ${mockBadcaseList.length} 条`);
          }
        }
      } catch (error) {
        console.error('❌ 初始化数据失败:', error);
        // 降级到 localStorage
        const savedData = localStorage.getItem('badcaseList');
        if (savedData) {
          try {
            setBadcaseList(JSON.parse(savedData));
          } catch {
            setBadcaseList(mockBadcaseList);
          }
        } else {
          setBadcaseList(mockBadcaseList);
        }
        setUseSupabase(false);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 🚀 Supabase Realtime 订阅 - 实时同步数据
  useEffect(() => {
    if (!useSupabase) {
      console.log('💾 使用 localStorage 模式，不启用实时订阅');
      return;
    }

    console.log('🔔 启动 Supabase Realtime 订阅...');

    // 订阅 badcases 表的所有变化
    const channel = supabase
      .channel('badcases-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // 监听所有事件：INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'badcases',
        },
        (payload) => {
          console.log('🔔 收到数据库变化:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              // 新增数据 - 需要进行字段映射
              const newRecordRaw = payload.new as any;
              const newRecord: BadcaseData = {
                id: newRecordRaw.id,
                date: newRecordRaw.date,
                subject: newRecordRaw.subject,
                location: newRecordRaw.location,
                fullTtsLessonId: newRecordRaw.full_tts_lesson_id,
                cmsId: newRecordRaw.cms_id,
                reporter: newRecordRaw.reporter,
                category: newRecordRaw.category,
                expectedFixDate: newRecordRaw.expected_fix_date,
                status: newRecordRaw.status,
                description: newRecordRaw.description,
                audioUrl: newRecordRaw.audio_url,
                videoUrl: newRecordRaw.video_url,
                modelId: newRecordRaw.model_id,
                remark: newRecordRaw.remark,
                createdAt: newRecordRaw.created_at ? new Date(newRecordRaw.created_at).toLocaleString('zh-CN') : '',
                updatedAt: newRecordRaw.updated_at ? new Date(newRecordRaw.updated_at).toLocaleString('zh-CN') : '',
              };
              console.log('➕ 新增 Badcase:', newRecord.id, newRecord);
              setBadcaseList((prev) => {
                // 检查是否已存在（避免重复）
                if (prev.some((item) => item.id === newRecord.id)) {
                  console.debug('⚠️ 数据已存在，跳过添加');
                  return prev;
                }
                return [newRecord, ...prev];
              });
              break;

            case 'UPDATE':
              // 更新数据 - 需要进行字段映射
              const updatedRecordRaw = payload.new as any;
              const updatedRecord: BadcaseData = {
                id: updatedRecordRaw.id,
                date: updatedRecordRaw.date,
                subject: updatedRecordRaw.subject,
                location: updatedRecordRaw.location,
                fullTtsLessonId: updatedRecordRaw.full_tts_lesson_id,
                cmsId: updatedRecordRaw.cms_id,
                reporter: updatedRecordRaw.reporter,
                category: updatedRecordRaw.category,
                expectedFixDate: updatedRecordRaw.expected_fix_date,
                status: updatedRecordRaw.status,
                description: updatedRecordRaw.description,
                audioUrl: updatedRecordRaw.audio_url,
                videoUrl: updatedRecordRaw.video_url,
                modelId: updatedRecordRaw.model_id,
                remark: updatedRecordRaw.remark,
                createdAt: updatedRecordRaw.created_at ? new Date(updatedRecordRaw.created_at).toLocaleString('zh-CN') : '',
                updatedAt: updatedRecordRaw.updated_at ? new Date(updatedRecordRaw.updated_at).toLocaleString('zh-CN') : '',
              };
              console.log('✏️ 更新 Badcase:', updatedRecord.id, updatedRecord);
              setBadcaseList((prev) =>
                prev.map((item) =>
                  item.id === updatedRecord.id ? updatedRecord : item
                )
              );
              break;

            case 'DELETE':
              // 删除数据
              const deletedRecord = payload.old as BadcaseData;
              console.log('🗑️ 删除 Badcase:', deletedRecord.id);
              setBadcaseList((prev) =>
                prev.filter((item) => item.id !== deletedRecord.id)
              );
              break;

            default:
              console.log('⚠️ 未知的事件类型:', payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime 订阅成功');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime 订阅失败');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime 订阅超时');
        } else {
          console.log('📡 Realtime 状态:', status);
        }
      });

    // 清理函数：组件卸载时取消订阅
    return () => {
      console.log('🔇 取消 Realtime 订阅');
      supabase.removeChannel(channel);
    };
  }, [useSupabase]);

  // 当不使用 Supabase 时，保存到 localStorage
  useEffect(() => {
    if (!loading && !useSupabase) {
      // 立即同步到 localStorage（包括空列表）
      localStorage.setItem('badcaseList', JSON.stringify(badcaseList));
      console.log(`💾 数据已保存到 localStorage (共 ${badcaseList.length} 条)`);
    }
  }, [badcaseList, useSupabase, loading]);

  const addBadcase = async (badcase: BadcaseData) => {
    try {
      if (useSupabase) {
        // 使用 Supabase
        const created = await badcaseApi.createBadcase(badcase);
        setBadcaseList((prev) => [created, ...prev]);
      } else {
        // 使用 localStorage - 立即同步
        const updatedList = [badcase, ...badcaseList];
        
        // 立即保存到 localStorage
        localStorage.setItem('badcaseList', JSON.stringify(updatedList));
        console.log('💾 新增已立即保存到 localStorage:', badcase.id);
        
        // 更新状态
        setBadcaseList(updatedList);
      }
    } catch (error: any) {
      console.error('❌ 添加 Badcase 失败:', error);
      console.error('❌ 错误消息:', error?.message);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const updateBadcase = async (id: string, updates: Partial<BadcaseData>) => {
    try {
      if (useSupabase) {
        // 使用 Supabase
        const updated = await badcaseApi.updateBadcase(id, updates);
        setBadcaseList((prev) =>
          prev.map((item) => (item.id === id ? updated : item))
        );
      } else {
        // 使用 localStorage - 立即同步
        const updatedList = badcaseList.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                updatedAt: new Date().toLocaleString('zh-CN'),
              }
            : item
        );
        
        // 立即保存到 localStorage
        localStorage.setItem('badcaseList', JSON.stringify(updatedList));
        console.log('💾 更新已立即保存到 localStorage:', id);
        
        // 更新状态
        setBadcaseList(updatedList);
      }
    } catch (error: any) {
      console.error('❌ 更新 Badcase 失败:', error);
      console.error('❌ 错误消息:', error?.message);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const deleteBadcase = async (id: string) => {
    try {
      if (useSupabase) {
        // 使用 Supabase
        await badcaseApi.deleteBadcase(id);
        setBadcaseList((prev) => prev.filter((item) => item.id !== id));
        console.log('✅ 已从 Supabase 删除:', id);
      } else {
        // 使用 localStorage
        setBadcaseList((prev) => prev.filter((item) => item.id !== id));
        console.log('✅ 已从 localStorage 删除:', id);
      }
    } catch (error: any) {
      console.error('❌ 删除 Badcase 失败:', error);
      console.error('❌ 错误消息:', error?.message);
      console.error('❌ 错误详情:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const refreshList = async () => {
    try {
      if (useSupabase) {
        setLoading(true);
        const data = await badcaseApi.getAllBadcases();
        setBadcaseList(data);
        console.log('✅ 数据已刷新');
      } else {
        // localStorage 模式下，只需触发重新渲染
        setBadcaseList([...badcaseList]);
      }
    } catch (error) {
      console.error('❌ 刷新列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BadcaseContext.Provider
      value={{
        badcaseList,
        addBadcase,
        updateBadcase,
        deleteBadcase,
        refreshList,
        loading,
        useSupabase,
      }}
    >
      {children}
    </BadcaseContext.Provider>
  );
};

export const useBadcase = () => {
  const context = useContext(BadcaseContext);
  if (context === undefined) {
    throw new Error('useBadcase must be used within a BadcaseProvider');
  }
  return context;
};

