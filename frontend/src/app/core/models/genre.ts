// Khớp với GenreDto / CreateUpdateGenreRequest trong backend/SoundSpace.Core/Models/Catalog.
export interface Genre {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  dateCreated: string;
  dateModified: string | null;
}

export interface CreateUpdateGenreRequest {
  name: string;
  slug: string;
  icon: string | null;
  coverImageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}
