export interface ILoginFormData {
  email: string;
  password: string;
}

export interface ILoginResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
}

