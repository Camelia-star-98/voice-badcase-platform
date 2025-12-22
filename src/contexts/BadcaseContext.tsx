import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BadcaseData } from '../types';
import { mockBadcaseList } from '../api/mockData';
import * as badcaseApi from '../api/badcaseApi';

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

  // 当不使用 Supabase 时，保存到 localStorage
  useEffect(() => {
    if (!loading && !useSupabase && badcaseList.length > 0) {
      localStorage.setItem('badcaseList', JSON.stringify(badcaseList));
      console.log('💾 数据已保存到 localStorage');
    }
  }, [badcaseList, useSupabase, loading]);

  const addBadcase = async (badcase: BadcaseData) => {
    try {
      if (useSupabase) {
        // 使用 Supabase
        const created = await badcaseApi.createBadcase(badcase);
        setBadcaseList((prev) => [created, ...prev]);
      } else {
        // 使用 localStorage
        setBadcaseList((prev) => [badcase, ...prev]);
      }
    } catch (error) {
      console.error('❌ 添加 Badcase 失败:', error);
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
        // 使用 localStorage
        setBadcaseList((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...updates,
                  updatedAt:
                    new Date().toLocaleString('zh-CN'),
                }
              : item
          )
        );
      }
    } catch (error) {
      console.error('❌ 更新 Badcase 失败:', error);
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
    } catch (error) {
      console.error('❌ 删除 Badcase 失败:', error);
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

