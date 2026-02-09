export function passwordChangeOTPText({ name, otp }) {
  return `
Hello ${name},

We received a request to change the password for your Taskaro account.

To continue, please verify your identity by entering the One-Time Password (OTP) below:

🔐 Verification Code: ${otp}

This code is valid for the next 10 minutes.  
If you did not request this change, please ignore this email — your account is safe.

For security reasons, never share this OTP with anyone.

Best regards,  
Team Taskaro  
Simplify Work. Amplify Results.
`;
}
