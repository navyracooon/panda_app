import Assignment from "../models/Assignment";
import Attachment from "../models/Attachment";
import Site from "../models/Site";

export default class PandaParser {
  static parseAssignment(data: any): Assignment {
    return new Assignment(
      data.access,
      data.allPurposeItemText,
      data.allowPeerAssessment,
      data.allowResubmission,
      data.anonymousGrading,
      data.attachments.map((attachment: any) =>
        PandaParser.parseAttachment(attachment),
      ),
      data.author,
      data.authorLastModified,
      new Date(data.closeTime.epochSecond * 1000),
      data.closeTimeString,
      data.content,
      data.context,
      data.creator,
      data.draft,
      new Date(data.dropDeadTime.epochSecond * 1000),
      data.dropDeadTimeString,
      new Date(data.dueTime.epochSecond * 1000),
      data.dueTimeString,
      data.gradeScale,
      data.gradeScaleMaxPoints,
      data.gradebookItemId,
      data.gradebookItemName,
      data.groups,
      data.id,
      data.instructions,
      data.ltiGradableLaunch,
      data.maxGradePoint,
      data.modelAnswerText,
      new Date(data.openTime.epochSecond * 1000),
      data.openTimeString,
      data.position,
      data.privateNoteText,
      data.section,
      data.status,
      data.submissions,
      data.submissionType,
      new Date(data.timeCreated.epochSecond * 1000),
      new Date(data.timeLastModified.epochSecond * 1000),
      data.title,
    );
  }

  static parseAttachment(data: any): Attachment {
    return new Attachment(data.name, data.ref, data.size, data.type, data.url);
  }

  static parseSite(data: any): Site {
    return new Site(
      data.activeEdit,
      data.contactEmail,
      data.contactName,
      new Date(data.createdDate),
      data.customPageOrdered,
      data.description,
      data.empty,
      data.htmlDescription,
      data.htmlShortDescription,
      data.iconUrl,
      data.iconUrlFull,
      data.id,
      data.infoUrl,
      data.infoUrlFull,
      data.joinable,
      data.joinerRole,
      data.lastModified,
      data.maintainRole,
      new Date(data.modifiedDate),
      data.owner,
      data.props,
      data.providerGroupId,
      data.pubView,
      data.published,
      data.realmLock,
      data.realmLocks,
      data.reference,
      data.shortDescription,
      data.siteGroups,
      data.siteGroupsList,
      data.siteOwner,
      data.sitePages,
      data.skin,
      data.softlyDeleted,
      new Date(data.softlyDeletedDate),
      data.title,
      data.type,
      data.userRoles,
    );
  }
}
