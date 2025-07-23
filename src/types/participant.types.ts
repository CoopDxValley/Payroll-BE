export interface CampaignParticipantInput {
  campaignId: string;
  numberOfDaysInUrban: number;
  numberOfDaysInRural: number;
  fullName: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phoneNumber: string;
  accountNumber?: string;
  paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
  companyId: string;
  isVerified: Boolean;
  detail?: string;
  files?: Express.Multer.File[];
}

export interface CampaignParticipantUpdateInput {
  fullName: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phoneNumber: string;
  accountNumber: string;
  paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";

  numberOfDaysInUrban: number;
  numberOfDaysInRural: number;
  detail?: string;

  files?: Express.Multer.File[];
}
