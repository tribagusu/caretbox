export interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

// Current user
export const currentUser: User = {
  id: "user_1",
  email: "john@example.com",
  name: "John Doe",
  isPro: false,
};
