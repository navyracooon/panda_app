import * as cheerio from "cheerio";
import { URLSearchParams } from "url";

import User from "../models/User";
import Assignment from "../models/Assignment";
import Attachment from "../models/Attachment";

export default class PandaParser {
  static async getAllAssignmentInfo(user: User): Promise<Assignment[]> {
    await PandaParser.loginPanda(user);
    const allAssignmentInfoUrl =
      "https://panda.ecs.kyoto-u.ac.jp/direct/assignment/my.json";
    const response = await user.session.get(allAssignmentInfoUrl);

    const assignmentList = response.data["assignment_collection"].map(
      (responseAssignment: any) => {
        return new Assignment(
          responseAssignment.access,
          responseAssignment.allPurposeItemText,
          responseAssignment.allowPeerAssessment,
          responseAssignment.allowResubmission,
          responseAssignment.anonymousGrading,
          responseAssignment.attachments.map(
            (attachment: any) =>
              new Attachment(
                attachment.name,
                attachment.ref,
                attachment.size,
                attachment.type,
                attachment.url,
              ),
          ),
          responseAssignment.author,
          responseAssignment.authorLastModified,
          new Date(responseAssignment.closeTime.epochSecond * 1000),
          responseAssignment.closeTimeString,
          responseAssignment.context,
          responseAssignment.creator,
          responseAssignment.draft,
          new Date(responseAssignment.dropDeadTime.epochSecond * 1000),
          responseAssignment.dropDeadTimeString,
          new Date(responseAssignment.dueTime.epochSecond * 1000),
          responseAssignment.dueTimeString,
          responseAssignment.gradeScale,
          responseAssignment.gradeScaleMaxPoints,
          responseAssignment.gradebookItemId,
          responseAssignment.gradebookItemName,
          responseAssignment.id,
          responseAssignment.instructions,
          responseAssignment.ltiGradableLaunch,
          responseAssignment.maxGradePoint,
          responseAssignment.modelAnswerText,
          new Date(responseAssignment.openTime.epochSecond * 1000),
          responseAssignment.openTimeString,
          responseAssignment.position,
          responseAssignment.privateNoteText,
          responseAssignment.section,
          responseAssignment.status,
          responseAssignment.submissionType,
          new Date(responseAssignment.timeCreated.epochSecond * 1000),
          new Date(responseAssignment.timeLastModified.epochSecond * 1000),
          responseAssignment.title,
          responseAssignment.entityReference,
          responseAssignment.entityURL,
          responseAssignment.entityId,
          responseAssignment.entityTitle,
        );
      },
    );

    return assignmentList;
  }

  static async loginPanda(user: User): Promise<void> {
    const loginUrl =
      "https://panda.ecs.kyoto-u.ac.jp/cas/login?service=https%3A%2F%2Fpanda.ecs.kyoto-u.ac.jp%2Fsakai-login-tool%2Fcontainer";

    try {
      const response = await user.session.get(loginUrl);
      const $ = cheerio.load(response.data);

      const lt = $('input[name="lt"]').val();
      const execution = $('input[name="execution"]').val();

      if (!lt || !execution) {
        throw new Error(
          `Failed to retrieve login form fields. lt: ${lt}, execution: ${execution}`,
        );
      }

      const formData = new URLSearchParams();
      formData.append("username", user.username);
      formData.append("password", user.password);
      formData.append("lt", lt as string);
      formData.append("execution", execution as string);
      formData.append("_eventId", "submit");

      await user.session.post(loginUrl, formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      await user.jar.getCookies(loginUrl);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }
}
