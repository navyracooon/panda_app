import axios from "axios";
import PandaParser from "./PandaParser";
import URLParser from "./URLParser";
import Assignment from "../models/Assignment";
import Site from "../models/Site";
import User from "../models/User";

export default class PandaUtils {
  static async loginPanda(
    user: User,
    retryOnError: boolean = true,
  ): Promise<void> {
    try {
      const currentStatus = await this.userStatus(user);
      if (currentStatus) {
        return;
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
        throw new Error(
          `Failed to login with provided credentials. \n
            username: ${user.username}, \n
            error: ${URLParser.getDivContentByClass(loginResponse.data, "errors")}`,
        );
      }
    } catch (e) {
      console.error(`Login failed: ${e}`);
      if (retryOnError) {
        await this.logoutPanda(user);
        await this.loginPanda(user, false);
      }
    }
  }

  static async logoutPanda(user: User): Promise<void> {
    const logoutUrl = "https://panda.ecs.kyoto-u.ac.jp/portal/logout";
    await user.session.get(logoutUrl);
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

  static async getAllAssignments(user: User): Promise<Assignment[]> {
    await this.loginPanda(user);
    const assignmentUrl =
      "https://panda.ecs.kyoto-u.ac.jp/direct/assignment/my.json";
    const response = await user.session.get(assignmentUrl);

    const assignmentList = response.data["assignment_collection"]
      .map((assignment: any) => PandaParser.parseAssignment(assignment))
      // PandAのレスポンスに期限切れの課題が含まれることがある
      .filter((assignment: Assignment) => {
        return assignment.dueTime > new Date();
      });

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
    const response = await user.session.get(siteUrl);

    const site = PandaParser.parseSite(response.data);
    return site;
  }
}
