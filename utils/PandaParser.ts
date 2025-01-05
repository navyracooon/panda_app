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
        this.parseAttachment(attachment),
      ),
      data.author,
      data.authorLastModified,
      data.closeTime.epochSecond * 1000,
      data.closeTimeString,
      data.content,
      data.context,
      data.creator,
      data.draft,
      data.dropDeadTime.epochSecond * 1000,
      data.dropDeadTimeString,
      data.dueTime.epochSecond * 1000,
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
      data.openTime.epochSecond * 1000,
      data.openTimeString,
      data.position,
      data.privateNoteText,
      data.section,
      data.status,
      data.submissions,
      data.submissionType,
      data.timeCreated.epochSecond * 1000,
      data.timeLastModified.epochSecond * 1000,
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
      data.createdDate,
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
      data.modifiedDate,
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
      data.siteOwner,
      data.sitePages,
      data.skin,
      data.softlyDeleted,
      data.softlyDeletedDate,
      data.title,
      data.type,
      data.userRoles,
    );
  }
}
