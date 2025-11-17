'use client';

import { useState } from 'react';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { SignInForm } from '@/components/auth/sign-in-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [tab, setTab] = useState('signin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">MoneyMatters</h1>
          <p className="text-muted-foreground">Smart expense tracking for modern finances</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-6">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
