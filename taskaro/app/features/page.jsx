// app/features/page.jsx
import { FaUsers, FaTasks, FaBell, FaChartLine, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';
import { FiUserCheck, FiMail } from 'react-icons/fi';

export default function page() {
  const features = [
    {
      icon: <FaUsers className="text-4xl text-blue-400" />,
      title: "Team Management",
      description: "Create unlimited teams, assign roles, and manage members with granular permissions",
      bullets: [
        "Create departments/sub-teams",
        "Role-based access control",
        "Team performance analytics"
      ]
    },
    {
      icon: <FaTasks className="text-4xl text-blue-400" />,
      title: "Task Automation",
      description: "Streamline your workflow with smart task assignment and tracking",
      bullets: [
        "Create, assign & prioritize tasks",
        "Recurring task scheduling",
        "Task progress tracking",
        "Deadline reminders"
      ]
    },
    {
      icon: <FaBell className="text-4xl text-blue-400" />,
      title: "Smart Notifications",
      description: "Stay informed with intelligent alerts across multiple channels",
      bullets: [
        "In-app notifications",
        "Email alerts",
        "SMS reminders",
        "Custom notification rules"
      ]
    },
    {
      icon: <FaChartLine className="text-4xl text-blue-400" />,
      title: "Admin Dashboard",
      description: "Comprehensive overview of all organizational activities",
      bullets: [
        "Real-time activity monitoring",
        "Performance metrics",
        "Custom report generation",
        "Export-ready analytics"
      ]
    },
    {
      icon: <FaRupeeSign className="text-4xl text-blue-400" />,
      title: "Dues Management",
      description: "Track payments and financial obligations effortlessly",
      bullets: [
        "Payment reminders",
        "Due date tracking",
        "Transaction history",
        "Receipt generation"
      ]
    },
    {
      icon: <FiUserCheck className="text-4xl text-blue-400" />,
      title: "Attendance System",
      description: "Automated attendance tracking with geofencing",
      bullets: [
        "Clock-in/clock-out",
        "Leave management",
        "Overtime calculation",
        "Attendance reports"
      ]
    },
    {
      icon: <FiMail className="text-4xl text-blue-400" />,
      title: "Notice Board",
      description: "Organization-wide communication made simple",
      bullets: [
        "Broadcast announcements",
        "Targeted messaging",
        "Read receipts",
        "Notice archives"
      ]
    },
    {
      icon: <FaCalendarAlt className="text-4xl text-blue-400" />,
      title: "Calendar Sync",
      description: "Seamless integration with your existing calendar",
      bullets: [
        "Google Calendar integration",
        "Team calendar view",
        "Event reminders",
        "Leave calendar"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 text-white py-12 px-4">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Power Up Your Productivity with <span className="text-blue-400">Taskaro</span>
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Everything you need to manage tasks, teams and workflows in one powerful platform
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-blue-400/50 transition-all hover:scale-[1.02]">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300 mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start">
                    <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Spotlight */}
      <section className="max-w-6xl mx-auto mt-32">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-blue-400">Automated</span> Workflows That Save You Hours
            </h2>
            <p className="text-gray-300 mb-6">
              Taskaro's intelligent automation handles repetitive work so your team can focus on what matters most.
              Set up custom workflows that trigger actions based on your business rules.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <FaBell className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold">Smart Alerts</h3>
                  <p className="text-gray-300 text-sm">
                    Automatic notifications when tasks are overdue or completed
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <FaTasks className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold">Task Templates</h3>
                  <p className="text-gray-300 text-sm">
                    Save workflows as templates for repeated projects
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <FaChartLine className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold">Performance Insights</h3>
                  <p className="text-gray-300 text-sm">
                    Automatic reports on team productivity and bottlenecks
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="relative aspect-video">
              {/* Replace with your feature demo video/image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700/50 rounded-lg">
                <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="max-w-6xl mx-auto mt-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Works With Your Favorite Tools</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Taskaro connects with the apps you already use daily
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { name: "Google Calendar", icon: "📅" },
            { name: "WhatsApp", icon: "💬" },
            { name: "Slack", icon: "💼" },
            { name: "Zoom", icon: "🎥" },
            { name: "QuickBooks", icon: "💰" },
            { name: "Microsoft Teams", icon: "👥" },
          ].map((tool, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center w-32 h-32 hover:scale-110 transition-transform">
              <span className="text-3xl mb-2">{tool.icon}</span>
              <span className="text-center">{tool.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto mt-32 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Transform Your Team's Productivity?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of businesses using Taskaro to streamline their operations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
            Start Free Trial
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
            Request Demo
          </button>
        </div>
      </section>
    </div>
  );
}
