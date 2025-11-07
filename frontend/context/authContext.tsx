import { login, register } from "@/services/authService";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import { useRouter } from "expo-router";
import {
  createContext,
  ReactNode,
  useState,
  useContext,
  use,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { connetSocket, disconnectSocket } from "@/socket/socket";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const router = useRouter();

  const goToHomePage = () => {
    setTimeout(() => {
      router.replace("/(main)/home");
    }, 1500);
  };

  const goToWelcomePage = () => {
    setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 1500);
  };

  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          // Token expired
          await AsyncStorage.removeItem("token");
          goToWelcomePage();
          return;
        }

        //user is logged in
        setToken(storedToken);
        await connetSocket();
        setUser(decoded.user);
        goToHomePage();
      } catch (error) {
        goToWelcomePage();
        console.error("Failed to decode token:", error);
      }
    } else {
      goToWelcomePage();
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  const updateToken = async (newToken: string) => {
    if (newToken) {
      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);

      // decode token to get user info
      const decoded = jwtDecode<DecodedTokenProps>(newToken);
      console.log("Decoded token:", decoded);
      setUser(decoded.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);
    await updateToken(response.token);
    await connetSocket();
    router.replace("/(main)/home");
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string | null
  ) => {
    const response = await register(email, password, name, avatar);
    await updateToken(response.token);
    await connetSocket();
    router.replace("/(main)/home");
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    disconnectSocket();
    router.push("/(auth)/welcome");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, signIn, signUp, signOut, updateToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
