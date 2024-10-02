import Attachment from "./Attachment";

export default class Assignment {
  constructor(
    public access: string,
    public allPurposeItemText: string,
    public allowPeerAssessment: boolean,
    public allowResubmission: boolean,
    public anonymousGrading: boolean,
    public attachments: Attachment[],
    public author: string,
    public authorLastModified: string,
    public closeTime: Date,
    public closeTimeString: string,
    public context: string,
    public creator: string,
    public draft: boolean,
    public dropDeadTime: Date,
    public dropDeadTimeString: string,
    public dueTime: Date,
    public dueTimeString: string,
    public gradeScale: string,
    public gradeScaleMaxPoints: string,
    public gradebookItemId: number,
    public gradebookItemName: string,
    public id: string,
    public instructions: string,
    public ltiGradableLaunch: string,
    public maxGradePoint: string,
    public modelAnswerText: string,
    public openTime: Date,
    public openTimeString: string,
    public position: number,
    public privateNoteText: string,
    public section: string,
    public status: string,
    public submissionType: string,
    public timeCreated: Date,
    public timeLastModified: Date,
    public title: string,
    public entityReference: string,
    public entityURL: string,
    public entityId: string,
    public entityTitle: string,
  ) {}
}