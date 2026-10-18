// Khớp với ProfileDto trong backend/SoundSpace.Core/Models/UserProfile.
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
  dateCreated: string;
}
