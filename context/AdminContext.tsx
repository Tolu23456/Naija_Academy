import React, { createContext, useContext, useState } from 'react';

const ADMIN_EMAIL    = 'naijacdm@gmail.com';
const ADMIN_PASSWORD = 'Esclapes123#';

type AdminContextType = {
  isAdminEmail:      (email: string) => boolean;
  isAdminCredentials:(email: string, password: string) => boolean;
  isAdminVerified:   boolean;
  setAdminVerified:  (v: boolean) => void;
  clearAdminSession: () => void;
};

const AdminContext = createContext<AdminContextType>({
  isAdminEmail:       () => false,
  isAdminCredentials: () => false,
  isAdminVerified:    false,
  setAdminVerified:   () => {},
  clearAdminSession:  () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  const isAdminEmail = (email: string) =>
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const isAdminCredentials = (email: string, password: string): boolean =>
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD;

  const setAdminVerified = (v: boolean) => setIsAdminVerified(v);
  const clearAdminSession = () => setIsAdminVerified(false);

  return (
    <AdminContext.Provider value={{
      isAdminEmail,
      isAdminCredentials,
      isAdminVerified,
      setAdminVerified,
      clearAdminSession,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
