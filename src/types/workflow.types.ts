export type ApprovalStage = {
  name: string;
  roles: string[]; // or more strictly ``role_${string}[]``
};

export type CampaignApprovalFlow = {
  name: string;
  departmentId: string;
  companyId: string;
  stages: ApprovalStage[];
};
