interface ChatLog {
  user: string;
  message: string;
}

interface Model {
  created: null;
  id: string;
  object: string;
  owner: string;
  permissions: null;
  ready: boolean;
}

interface Message {
  text: string;
  createdAt: admin.firestore.Timestamp;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
}
declare module "tw-elements";
