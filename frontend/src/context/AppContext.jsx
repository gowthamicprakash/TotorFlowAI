import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranchState] = useState(null);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const selectBranch = useCallback((branch) => {
    if (!branch) {
      setSelectedBranchState(null);
      localStorage.removeItem('selectedBranchId');
      return;
    }
    setSelectedBranchState(branch);
    localStorage.setItem('selectedBranchId', branch.id.toString());
  }, []);

  const loadBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const res = await api.get('/branches');
      const list = res.data || [];
      setBranches(list);

      if (list.length === 0) {
        setSelectedBranchState(null);
        localStorage.removeItem('selectedBranchId');
        return list;
      }

      const savedId = localStorage.getItem('selectedBranchId');
      const saved = list.find((branch) => branch.id.toString() === savedId);
      setSelectedBranchState((current) => {
        const currentMatch = current ? list.find((branch) => branch.id === current.id) : null;
        const chosen = currentMatch || saved || list[0];
        localStorage.setItem('selectedBranchId', chosen.id.toString());
        return chosen;
      });
      return list;
    } catch (err) {
      console.error('Failed to load branches', err);
      return [];
    } finally {
      setBranchesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadBranches();
    } else {
      setBranches([]);
      setSelectedBranchState(null);
    }
  }, [user, loadBranches]);

  const changeBranch = selectBranch;

  const login = useCallback((authResponse) => {
    const { token, ...profile } = authResponse;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBranchId');
    setUser(null);
    setBranches([]);
    setSelectedBranchState(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        branches,
        selectedBranch,
        branchesLoading,
        changeBranch,
        loadBranches,
        refreshBranches: loadBranches,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
