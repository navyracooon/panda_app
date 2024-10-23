import axios, { AxiosInstance } from "axios";
import PandaUtils from "../utils/PandaUtils";

export default class User {
  username: string;
  password: string;
  session: AxiosInstance;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;

    this.session = axios.create({ withCredentials: true });
  }

  async checkLogin(): Promise<boolean> {
    try {
      await PandaUtils.loginPanda(this);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
