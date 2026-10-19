// Khớp với ProfileDto trong backend/SoundSpace.Core/Models/UserProfile.
export interface Profile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
  dateCreated: string;
}

// Khớp với UpdateProfileRequest / ChangePasswordRequest trong backend/SoundSpace.Core/Models/UserProfile.
export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
