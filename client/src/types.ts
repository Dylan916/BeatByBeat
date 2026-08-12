export interface Track {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  spotifyUrl?: string;
  previewUrl?: string;
}

export interface PresetPlaylist {
  id: string;
  title: string;
  description: string;
  category: string;
  spotifyId: string;
  coverImage: string;
  badge?: string;
}
