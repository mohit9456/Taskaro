export function resetPasswordText({ name, resetURL }) {
  return `
  Dear ${name},

  We received a request to reset the password for your Taskaro account. No worries, you can easily reset your password by following the instructions below:

  Step 1: Click on the link below to reset your password:
  ${resetURL}

  Step 2: Enter a new password of your choice.

  This link will expire in 1 hour for security reasons. If you didn’t request this reset, please ignore this email, and your password will remain unchanged.

  For any assistance, feel free to contact our support team at support@taskaro.com

  Thank you for choosing Taskaro!

  Best Regards,
  Taskaro Team
  Taskaro Gulf Businness Apartment, Nasik (Mumbai)
  ${process.env.BASE_URL}
  support@taskaro.com`;
}
