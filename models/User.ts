import axios, { AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

export default class User {
  username: string;
  password: string;
  jar: CookieJar;
  session: AxiosInstance;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;

    this.jar = new CookieJar();
    this.session = wrapper(
      axios.create({ jar: this.jar, withCredentials: true }),
    );
  }

  resetSession() {
    this.jar = new CookieJar();
    this.session = wrapper(
      axios.create({ jar: this.jar, withCredentials: true }),
    );
  }
}
