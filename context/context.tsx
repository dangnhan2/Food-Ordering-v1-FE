"use client";

import { GetCartByUser, RefreshToken } from "@/services/api";
import { useState, createContext, useContext, useEffect } from "react";
import axios from "@services/interceptor";

interface AuthContextType {
    user: IUser | undefined;
    setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>;
    accessToken: string | undefined;
    setAccessToken: React.Dispatch<React.SetStateAction<string | undefined>>;
    isAuthen : boolean | undefined;
    setIsAuthen : React.Dispatch<React.SetStateAction<boolean | undefined>>;
    refresh : () => Promise<void>;
    cart : ICart | undefined;
    setCart : React.Dispatch<React.SetStateAction<ICart | undefined>>;
    fetchCart : () => Promise<void>;
}  

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({children} : {children: React.ReactNode}) => {
    const [user, setUser] = useState<IUser>();
    const [accessToken, setAccessToken] = useState<string | undefined>();
    const [isAuthen, setIsAuthen] = useState<boolean | undefined>(false);
    const [cart, setCart] = useState<ICart>();

    useEffect(() => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) setAccessToken(token);
      }
    }, []);
    
    const fetchCart = async () => {
      const id = user?.id
      if (id){
        let res = await GetCartByUser(id)         
        if (res.isSuccess && Number(res.statusCode) === 200){
          if (res.data)
          setCart(res.data)
        }
      }        
    }

    useEffect(() => {
      fetchCart()      
    }, [user?.id]);
    
    const refresh = async () => {
       try{
        let res = await RefreshToken();
        console.log(res);
        if (res){
            setUser(res.data?.data);
            const access_token = res.data?.accessToken;
            if (access_token)
            localStorage.setItem("access_token", access_token);
            setIsAuthen(true);
        }
       }catch(err){
        setUser(undefined);
        localStorage.removeItem("access_token");
       }
    }

    useEffect(() => {
       refresh()
    }, []);


    useEffect(() => {
        if (accessToken) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          localStorage.setItem("access_token", accessToken);
        } else {
          delete axios.defaults.headers.common["Authorization"];
          localStorage.removeItem("access_token");
        }
      }, [accessToken]);
    
      return (
        <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, isAuthen, setIsAuthen, refresh, cart, setCart, fetchCart }}>
          {children}
        </AuthContext.Provider>
      );
    };

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}