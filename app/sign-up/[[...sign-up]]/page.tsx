import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">注册账号</h1>
        <SignUp 
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