// app/about/page.jsx

export default function page() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Revolutionizing Task Management with <span className="text-blue-400">Taskaro</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Taskaro is transforming how teams collaborate and manage their workflows with intuitive,
                AI-powered task management solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                  <p className="font-medium">🚀 98% Productivity Boost</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                  <p className="font-medium">👥 10,000+ Happy Users</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Task Management Dashboard"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-blue-400 text-4xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-3">Simplify Workflows</h3>
              <p className="text-gray-300">
                Eliminate complexity in task management with our intuitive interface designed for teams of all sizes.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-blue-400 text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3">Enhance Collaboration</h3>
              <p className="text-gray-300">
                Break down silos with real-time collaboration features that keep everyone aligned.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-blue-400 text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-3">Drive Productivity</h3>
              <p className="text-gray-300">
                Leverage smart automation to focus on what truly matters for your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Taskaro?</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1415&q=80"
                alt="Taskaro Features"
                width={600}
                height={400}
                className="rounded-xl shadow-xl"
              />
            </div>
            <div className="lg:w-1/2">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Smart Task Automation</h3>
                    <p className="text-gray-300">
                      Automate repetitive tasks and focus on high-value work with our AI-powered automation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Seamless Integrations</h3>
                    <p className="text-gray-300">
                      Connect with Google Calendar, WhatsApp, Slack and all your favorite tools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
                    <p className="text-gray-300">
                      Get actionable insights with our comprehensive performance dashboards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
            <p className="max-w-2xl mx-auto mt-4 text-gray-300">
              A passionate group of innovators dedicated to transforming how you work
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rahul Sharma",
                role: "Founder & CEO",
                image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                bio: "Product visionary with 10+ years in task management solutions"
              },
              {
                name: "Priya Patel",
                role: "CTO",
                image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                bio: "Tech architect specializing in scalable productivity solutions"
              },
              {
                name: "Amit Singh",
                role: "Head of Product",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
                bio: "UX expert focused on creating intuitive workflows"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 hover:border-blue-400/50 transition-all">
                <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-blue-400 mb-2">{member.role}</p>
                <p className="text-gray-300">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of teams who have revolutionized their productivity with Taskaro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
              Start Free Trial
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
              Book a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

