import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">登录配置工具</h1>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              card: 'shadow-md',
            }
          }}
        />
      </div>
    </div>
  );
} 