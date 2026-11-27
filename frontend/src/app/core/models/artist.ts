// Khớp với các DTO nghệ sĩ trong backend/SoundSpace.Core/Models/Catalog.

/** ArtistDto: đầy đủ thông tin, dùng cho form sửa. */
export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  dateCreated: string;
  dateModified: string | null;
}

/** ArtistInListDto: một dòng trong bảng (không có tiểu sử, ảnh bìa). */
export interface ArtistInList {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  songCount: number;
  albumCount: number;
  dateCreated: string;
  dateModified: string | null;
}

export interface ArtistStats {
  total: number;
  active: number;
  hidden: number;
  featured: number;
}

/** Giá trị tham số status khi lọc (ArtistFilters ở backend); '' = tất cả. */
export type ArtistFilter = '' | 'active' | 'hidden' | 'featured';

export interface CreateUpdateArtistRequest {
  name: string;
  slug: string;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
}
