export default class Site {
  constructor(
    public activeEdit: boolean,
    public contactEmail: string,
    public contactName: string,
    public createdDate: Date,
    public customPageOrdered: boolean,
    public description: string,
    public empty: boolean,
    public htmlDescription: string,
    public htmlShortDescription: string,
    public iconUrl: string,
    public iconUrlFull: string,
    public id: string,
    public infoUrl: string,
    public infoUrlFull: string,
    public joinable: boolean,
    public joinerRole: string,
    public lastModified: number,
    public maintainRole: string,
    public modifiedDate: Date,
    public owner: string,
    public props: Map<string, any>,
    public providerGroupId: string,
    public pubView: boolean,
    public published: boolean,
    public realmLock: any,
    public realmLocks: any[],
    public reference: string,
    public shortDescription: string,
    public siteGroups: any[],
    public siteGroupsList: any[],
    public siteOwner: any,
    public sitePages: any[],
    public skin: string,
    public softlyDeleted: boolean,
    public softlyDeletedDate: Date,
    public title: string,
    public type: string,
    public userRoles: string[],
  ) {}
}
