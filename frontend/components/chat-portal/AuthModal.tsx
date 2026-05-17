"use client";

import { X, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  initialMode: "login" | "register";
  onClose: () => void;
  onSubmit: (mode: "login" | "register", payload: any) => void;
  isLoading: boolean;
  error?: string;
}

export function AuthModal({ initialMode, onClose, onSubmit, isLoading, error }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "register">(initialMode);
  
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authDOB, setAuthDOB] = useState("");
  const [authGender, setAuthGender] = useState("male");
  const [authAddress, setAuthAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = authMode === "login"
      ? { email: authEmail, password: authPassword }
      : { 
          name: authName, 
          email: authEmail, 
          phone: authPhone, 
          password: authPassword, 
          dob: authDOB || "1995-01-01", 
          gender: authGender, 
          address: authAddress || "City Center" 
        };
    onSubmit(authMode, payload);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-md font-bold text-foreground">
              {authMode === "login" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {authMode === "login"
                ? "Sign in to unlock your secure patient dashboard and past reports."
                : "Register to schedule consultations and save diagnostics."}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {authMode === "register" && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                  <Input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Phone Number</label>
                    <Input
                      type="tel"
                      required
                      placeholder="9999999999"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Date of Birth</label>
                    <Input
                      type="date"
                      required
                      value={authDOB}
                      onChange={(e) => setAuthDOB(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Gender</label>
                    <select
                      value={authGender}
                      onChange={(e) => setAuthGender(e.target.value)}
                      className="flex h-9 w-full rounded-xl border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">City/Address</label>
                    <Input
                      type="text"
                      required
                      placeholder="New York"
                      value={authAddress}
                      onChange={(e) => setAuthAddress(e.target.value)}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
              <Input
                type="email"
                required
                placeholder="john@example.com"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Password</label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/10 cursor-pointer text-xs transition-transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Connecting to Secure Portal...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  {authMode === "login" ? "Sign In" : "Create Account"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground border-t border-border pt-4">
            {authMode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className="text-primary hover:underline font-bold cursor-pointer"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className="text-primary hover:underline font-bold cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
