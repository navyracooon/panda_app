import axios from "axios";
import PandaParser from "./PandaParser";
import URLParser from "./URLParser";
import Assignment from "../models/Assignment";
import Site from "../models/Site";
import User from "../models/User";

export class PandaAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PandaAuthError";
  }
}

export default class PandaUtils {
  private static handleAxiosError(error: unknown, message: string): never {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      throw new PandaAuthError(message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }

  static async loginPanda(
    user: User,
    retryOnError: boolean = true,
    forceReauthenticate: boolean = false,
  ): Promise<void> {
    try {
      if (forceReauthenticate) {
        try {
          await this.logoutPanda(user);
        } catch (logoutError) {
          console.warn("Logout before forced login failed:", logoutError);
        }
      } else {
        const currentStatus = await this.userStatus(user);
        if (currentStatus) {
          return;
        }
      }

      const loginUrl =
        "https://panda.ecs.kyoto-u.ac.jp/cas/login?service=https%3A%2F%2Fpanda.ecs.kyoto-u.ac.jp%2Fsakai-login-tool%2Fcontainer";

      const response = await user.session.get(loginUrl);
      const lt = URLParser.getInputValueByName(response.data, "lt");
      const execution = URLParser.getInputValueByName(
        response.data,
        "execution",
      );

      if (!lt || !execution) {
        // ログイン済ならPandAはリダイレクトする
        if (loginUrl === response.request.responseUrl) {
          throw new Error(
            `Failed to parse lt or/and execution. lt: ${lt}, execution: ${execution}`,
          );
        }
        return;
      }

      const formData = new URLSearchParams();
      formData.append("username", user.username);
      formData.append("password", user.password);
      formData.append("lt", lt);
      formData.append("execution", execution);
      formData.append("_eventId", "submit");

      const loginResponse = await user.session.post(
        loginUrl,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const errorMessage = '<div id="msg" class="errors">';
      if (loginResponse.data.includes(errorMessage)) {
        const serverMessage =
          URLParser.getDivContentByClass(loginResponse.data, "errors") ??
          "Unknown error";
        throw new PandaAuthError(
          `Failed to login with provided credentials.\nusername: ${user.username}\nerror: ${serverMessage}`,
        );
      }

      const authenticated = await this.userStatus(user);
      if (!authenticated) {
        throw new PandaAuthError("Authentication failed after login attempt.");
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      if (retryOnError && !(error instanceof PandaAuthError)) {
        try {
          await this.logoutPanda(user);
        } catch (logoutError) {
          console.warn("Logout before retry failed:", logoutError);
        }
        await this.loginPanda(user, false, forceReauthenticate);
        return;
      }
      console.error("Login failed:", error);
      throw error;
    }
  }

  static async logoutPanda(user: User): Promise<void> {
    const logoutUrl = "https://panda.ecs.kyoto-u.ac.jp/portal/logout";
    const casLogoutUrl = "https://panda.ecs.kyoto-u.ac.jp/cas/logout";
    try {
      await user.session.get(logoutUrl);
      await user.session.get(casLogoutUrl);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return;
      }
      throw error;
    } finally {
      try {
        await user.clearCookies();
      } catch (cookieError) {
        console.warn("Failed to clear cookies on logout:", cookieError);
      }
    }
  }

  static async userStatus(user: User): Promise<boolean> {
    const userUrl = "https://panda.ecs.kyoto-u.ac.jp/direct/content/my";
    try {
      const response = await user.session.get(userUrl);
      return response.status === 200;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return false;
      }
      throw error;
    }
  }

  // 遅いので非推奨
  static async getAllAssignments(user: User): Promise<Assignment[]> {
    await this.loginPanda(user);
    const assignmentListUrl =
      "https://panda.ecs.kyoto-u.ac.jp/direct/assignment/my.json";
    let response;
    try {
      response = await user.session.get(assignmentListUrl);
    } catch (error) {
      this.handleAxiosError(
        error,
        "Session expired while fetching assignments.",
      );
    }
    if (!response) {
      throw new Error("Failed to fetch assignments: empty response.");
    }

    const assignmentList = response.data["assignment_collection"].map(
      (assignment: any) => PandaParser.parseAssignment(assignment),
    );

    await Promise.all(
      assignmentList.map(async (assignment: Assignment) => {
        assignment.site = await this.getSite(user, assignment.context);
      }),
    );
    return assignmentList;
  }

  static async getSite(user: User, siteId: string): Promise<Site> {
    await this.loginPanda(user);
    const siteUrl = `https://panda.ecs.kyoto-u.ac.jp/direct/site/${siteId}.json`;
    let response;
    try {
      response = await user.session.get(siteUrl);
    } catch (error) {
      this.handleAxiosError(
        error,
        `Session expired while fetching site ${siteId}.`,
      );
    }
    if (!response) {
      throw new Error(`Failed to fetch site ${siteId}: empty response.`);
    }

    const site = PandaParser.parseSite(response.data);
    return site;
  }

  static async getAllSites(user: User, key?: string): Promise<Site[]> {
    await this.loginPanda(user);
    const siteListUrl =
      "https://panda.ecs.kyoto-u.ac.jp/direct/site.json?_limit=1000";
    let response;
    try {
      response = await user.session.get(siteListUrl);
    } catch (error) {
      this.handleAxiosError(error, "Session expired while fetching sites.");
    }
    if (!response) {
      throw new Error("Failed to fetch sites: empty response.");
    }

    const siteList = response.data["site_collection"].map((site: any) =>
      PandaParser.parseSite(site),
    );

    if (key) {
      return siteList.filter((site: Site) => site.title.includes(key));
    }

    return siteList;
  }

  static async getAssignmentsBySite(
    user: User,
    site: Site,
  ): Promise<Assignment[]> {
    await this.loginPanda(user);
    const assignmentUrl = `https://panda.ecs.kyoto-u.ac.jp/direct/assignment/site/${site.id}.json`;
    let response;
    try {
      response = await user.session.get(assignmentUrl);
    } catch (error) {
      this.handleAxiosError(
        error,
        `Session expired while fetching assignments for ${site.id}.`,
      );
    }
    if (!response) {
      throw new Error(
        `Failed to fetch assignments for ${site.id}: empty response.`,
      );
    }

    const assignmentList = response.data["assignment_collection"].map(
      (assignment: any) => {
        const parsedAssignment = PandaParser.parseAssignment(assignment);
        parsedAssignment.site = site;
        return parsedAssignment;
      },
    );

    return assignmentList;
  }
}
