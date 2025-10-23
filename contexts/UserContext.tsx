import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import User from "../models/User";
import PandaUtils, { PandaAuthError } from "../utils/PandaUtils";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (ecsId: string, password: string) => Promise<void>;
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
      await user.checkLogin(true);
      await SecureStore.setItemAsync(
        "userCredentials",
        JSON.stringify({ ecsId, password }),
      );
      setUser(user);
    } catch (error) {
      await SecureStore.deleteItemAsync("userCredentials");
      throw error;
    }
  };

  const loadUser = async () => {
    try {
      const userCredentialsString =
        await SecureStore.getItemAsync("userCredentials");
      if (userCredentialsString) {
        const userCredentials = JSON.parse(userCredentialsString);
        const storedUser = new User(
          userCredentials.ecsId,
          userCredentials.password,
        );
        await storedUser.checkLogin();
        setUser(storedUser);
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof PandaAuthError) {
        console.warn("Stored credentials are no longer valid.");
      } else {
        console.error("Error loading user credentials:", error);
      }
      await SecureStore.deleteItemAsync("userCredentials");
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    if (!user) {
      await SecureStore.deleteItemAsync("userCredentials");
      setUser(null);
      return;
    }

    try {
      await PandaUtils.logoutPanda(user);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      await SecureStore.deleteItemAsync("userCredentials");
      setUser(null);
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
