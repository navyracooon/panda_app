import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import PandaUtils from "../utils/PandaUtils";

export default class User {
  username: string;
  password: string;
  session: AxiosInstance;
  private jar: CookieJar;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;

    this.jar = new CookieJar();
    this.session = wrapper(
      axios.create({
        withCredentials: true,
        jar: this.jar,
      } as any),
    );
  }

  async checkLogin(forceReauthenticate: boolean = false): Promise<void> {
    await PandaUtils.loginPanda(this, true, forceReauthenticate);
  }

  async clearCookies(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.jar.removeAllCookies((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
