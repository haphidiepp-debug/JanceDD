export interface Character {
  id: string;
  name: string;
  title: string;
  tags: string[];
  shortDesc: string;
  fullDesc: string;
  greeting: string;
  imageUrl: string;
  author: string;
  nsfw: boolean;
  stats: {
    chats: number;
    likes: number;
  };
}
