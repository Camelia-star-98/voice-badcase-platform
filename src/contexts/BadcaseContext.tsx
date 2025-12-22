import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BadcaseData } from '../types';
import { mockBadcaseList } from '../api/mockData';

interface BadcaseContextType {
  badcaseList: BadcaseData[];
  addBadcase: (badcase: BadcaseData) => void;
  updateBadcase: (id: string, updates: Partial<BadcaseData>) => void;
  deleteBadcase: (id: string) => void;
  refreshList: () => void;
}

const BadcaseContext = createContext<BadcaseContextType | undefined>(undefined);

export const BadcaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badcaseList, setBadcaseList] = useState<BadcaseData[]>(() => {
    // 尝试从 localStorage 读取数据
    const savedData = localStorage.getItem('badcaseList');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved badcase list:', e);
      }
    }
    return mockBadcaseList;
  });

  // 每次数据更新时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('badcaseList', JSON.stringify(badcaseList));
  }, [badcaseList]);

  const addBadcase = (badcase: BadcaseData) => {
    setBadcaseList((prev) => [badcase, ...prev]);
  };

  const updateBadcase = (id: string, updates: Partial<BadcaseData>) => {
    setBadcaseList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0] }
          : item
      )
    );
  };

  const deleteBadcase = (id: string) => {
    setBadcaseList((prev) => prev.filter((item) => item.id !== id));
  };

  const refreshList = () => {
    setBadcaseList([...badcaseList]);
  };

  return (
    <BadcaseContext.Provider
      value={{
        badcaseList,
        addBadcase,
        updateBadcase,
        deleteBadcase,
        refreshList,
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

