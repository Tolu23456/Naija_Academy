import React, { createContext, useContext, useState } from 'react';

const ADMIN_EMAIL   = 'naijacdm@gmail.com';
const ADMIN_PASSKEY = '001002003004005';

type AdminContextType = {
  isAdminEmail:     (email: string) => boolean;
  isAdminVerified:  boolean;
  verifyPasskey:    (key: string) => boolean;
  clearAdminSession: () => void;
};

const AdminContext = createContext<AdminContextType>({
  isAdminEmail:     () => false,
  isAdminVerified:  false,
  verifyPasskey:    () => false,
  clearAdminSession: () => {},
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  const isAdminEmail = (email: string) =>
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const verifyPasskey = (key: string): boolean => {
    if (key.trim() === ADMIN_PASSKEY) {
      setIsAdminVerified(true);
      return true;
    }
    return false;
  };

  const clearAdminSession = () => setIsAdminVerified(false);

  return (
    <AdminContext.Provider value={{ isAdminEmail, isAdminVerified, verifyPasskey, clearAdminSession }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
