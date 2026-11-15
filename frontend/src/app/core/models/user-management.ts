// Khớp với UserInListDto trong backend/SoundSpace.Core/Models/UserManagement.
export interface UserInList {
  id: string;
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  lastLoginDate: string | null;
  dateCreated: string;
}
