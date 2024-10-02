import User from "../../models/User";
import PandaParser from "../PandaParser";

describe("PandaParser", () => {
  test("Check dotenv can be loaded.", async () => {
    require("dotenv").config();

    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    if (username === undefined || password === undefined) {
      throw new Error(
        `Failed to read .env. username: ${username} password: ${password}`,
      );
    }
  });

  test("Check if it can retrieve assignment list.", async () => {
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;

    if (username === undefined || password === undefined) {
      throw new Error(
        `Failed to read .env. username: ${username} password: ${password}`,
      );
    }

    const user = new User(username, password);
    const res = await PandaParser.getAllAssignmentInfo(user);

    console.log(res);
    expect(res.length).toBeTruthy();
  }, 60000);
});
