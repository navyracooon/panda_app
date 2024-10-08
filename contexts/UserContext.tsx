import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import User from "../models/User";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (ecsId: string, password: string) => Promise<boolean>;
  loadUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (ecsId: string, password: string) => {
    const user = new User(ecsId, password);

    try {
      const isValid = await user.checkLogin();
      if (isValid) {
        await SecureStore.setItemAsync(
          "userCredentials",
          JSON.stringify({ ecsId, password }),
        );
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error while logging in:", error);
      return false;
    }
  };

  const loadUser = async () => {
    try {
      const userCredentialsString =
        await SecureStore.getItemAsync("userCredentials");
      if (userCredentialsString) {
        const userCredentials = JSON.parse(userCredentialsString);
        const user = new User(userCredentials.ecsId, userCredentials.password);
        const isValid = await user.checkLogin();
        if (isValid) {
          setUser(user);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Error loading user credentials:", error);
      return false;
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
    <UserContext.Provider value={{ user, setUser, login, loadUser, logout }}>
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
