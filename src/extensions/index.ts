import { Auth0Functions } from './Auth0Functions';

// Registry the generated app resolves custom functions from.
// Keys are "<Class>.<method>" and MUST match the extension function names the app was built with.
export const CustomFunctionRegistry: Record<string, (input: any) => Promise<any>> = {
  'Auth0Functions.sendPhoneOtp': Auth0Functions.sendPhoneOtp,
  'Auth0Functions.verifyPhoneOtp': Auth0Functions.verifyPhoneOtp,
  'Auth0Functions.login': Auth0Functions.login,
  'Auth0Functions.logout': Auth0Functions.logout,
  'Auth0Functions.getCredentials': Auth0Functions.getCredentials,
};

export async function executeCustomFunction(
  functionName: string,
  input: any
): Promise<any> {
  const fn = CustomFunctionRegistry[functionName];
  if (!fn) throw new Error(`Custom function not found: ${functionName}`);
  return fn(input);
}
