import axios, { AxiosInstance } from "axios";
import PandaParser from "../utils/PandaParser";

export default class User {
  username: string;
  password: string;
  session: AxiosInstance;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;

    this.session = axios.create({ withCredentials: true });
  }

  resetSession() {
    this.session = axios.create({ withCredentials: true });
  }

  async checkLogin(): Promise<boolean> {
    try {
      this.resetSession();
      await PandaParser.loginPanda(this);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
