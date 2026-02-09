export function subscribeMailText() {
  return `Hi there,

Welcome to Taskaro 👋  
We’re excited to have you on board!

Taskaro is built to simplify task management, improve team collaboration, and help you stay focused on what truly matters — getting things done.

Here’s what you can expect from Taskaro:
✔️ Smart task tracking to organize work effortlessly  
✔️ Seamless collaboration for teams and individuals  
✔️ Real-time updates so nothing slips through the cracks  
✔️ A clean, intuitive experience designed for productivity  

By subscribing, you’ll receive:
• Product updates & new feature announcements  
• Productivity tips for managing tasks efficiently  
• Exclusive insights on team workflows & growth strategies  

We believe great work starts with clarity — and Taskaro is here to give you exactly that.

If you ever have questions or feedback, feel free to reach out at:
support@taskaro.com

Let’s build smarter workflows together 🚀

Warm regards,  
Team Taskaro  
${process.env.BASE_URL}
support@taskaro.com
`;
}
