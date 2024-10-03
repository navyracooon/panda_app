import URLParser from "./URLParser";
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

    const response = await user.session.get(loginUrl);
    const lt = URLParser.getInputValueByName(response.data, "lt");
    const execution = URLParser.getInputValueByName(response.data, "execution");

    // ltやexecutionが取得できないのはログイン済みの時であるため
    // TODO: 適切な処理とは思えないので要検討
    if (!lt || !execution) {
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
        `Failed to login with provided credentials. username: ${user.username}.`,
      );
    }
  }
}
