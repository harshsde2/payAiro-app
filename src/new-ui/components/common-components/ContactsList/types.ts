export interface IContactItem {
  _id?: string;
  username?: string;
  nickname?: string;
  image?: string;
  email?: string;
}

export interface IContactsListProps {
  data?: IContactItem[];
}
