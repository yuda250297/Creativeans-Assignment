import Cookies from 'js-cookie';

const TOKEN_KEY = 'jwt_token';

export const authCookies = {
  /**
   * Save JWT token to cookie as session
   */
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      httpOnly: false, // Set to true if your backend sets it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: 7, // 7 days
    });
  },

  /**
   * Get JWT token from cookie
   */
  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_KEY);
  },

  /**
   * Remove JWT token from cookie
   */
  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  /**
   * Check if token exists
   */
  hasToken: (): boolean => {
    return !!Cookies.get(TOKEN_KEY);
  },
};
