export interface User {
  id: string;
  email?: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
    [key: string]: string | undefined;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}
