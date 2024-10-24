import Attachment from "./Attachment";
import Site from "./Site";

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
    public closeTime: number,
    public closeTimeString: string,
    public content: any,
    public context: string,
    public creator: string,
    public draft: boolean,
    public dropDeadTime: number,
    public dropDeadTimeString: string,
    public dueTime: number,
    public dueTimeString: string,
    public gradeScale: string,
    public gradeScaleMaxPoints: string,
    public gradebookItemId: number,
    public gradebookItemName: string,
    public groups: string[],
    public id: string,
    public instructions: string,
    public ltiGradableLaunch: string,
    public maxGradePoint: string,
    public modelAnswerText: string,
    public openTime: number,
    public openTimeString: string,
    public position: number,
    public privateNoteText: string,
    public section: string,
    public status: string,
    public submissions: any[],
    public submissionType: string,
    public timeCreated: number,
    public timeLastModified: number,
    public title: string,

    // AssignmentのAPIからは取得できない
    public site?: Site,
  ) {}
}
