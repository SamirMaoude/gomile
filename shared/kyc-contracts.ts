export type KycStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'NOT_SUBMITTED';

export type DocumentType =
  | 'DRIVING_LICENSE'
  | 'REGISTRATION_CARD'
  | 'RIB'
  | 'CNI'
  | 'PASSPORT'
  | 'OTHER';

export interface DriverDocument {
  id: string;
  type: DocumentType;
  url: string;
  verified: boolean;
  rejectionReason: string | null;
}

export interface DriverKycSubmission {
  id: string;
  status: KycStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface DriverKycStatus {
  status: KycStatus;
  documents: DriverDocument[];
  latestSubmission: DriverKycSubmission | null;
}

export interface KycActionResponse {
  message: string;
}

export interface RejectKycInput {
  rejectionReason: string;
}
