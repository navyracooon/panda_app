import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import User from "../models/User";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const loadUser = async () => {
    try {
      const userCredentialsString =
        await SecureStore.getItemAsync("userCredentials");
      if (userCredentialsString) {
        const userCredentials = JSON.parse(userCredentialsString);
        setUser(new User(userCredentials.ecsId, userCredentials.password));
      }
    } catch (error) {
      console.error("Error loading user credentials:", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("userCredentials");
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
