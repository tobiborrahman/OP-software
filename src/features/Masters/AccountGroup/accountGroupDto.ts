export interface AccountGroupDto {
  groupID?: number; // Assuming GroupID is auto-generated and optional when creating a new group
  groupName: string;
  underGroupID?: number; // Optional if UnderGroup can be null
  underGroup: string;
  fix?: string; // Optional based on your backend definition
}
