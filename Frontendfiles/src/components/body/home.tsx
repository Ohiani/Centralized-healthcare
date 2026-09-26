import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Users, Database, CheckCircle, Lock, Phone, Mail } from 'lucide-react';

type HomeProps = {
  onGetStarted?: () => void;
};

export default function CMRSWebsite({ onGetStarted }: HomeProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('patients');
  const handleGetStarted = () => {
    setMobileMenuOpen(false);
    onGetStarted?.();
    navigate('/dashboard');
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-green-700 to-green-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-7 h-7 text-green-700" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-xl">CMRS</h1>
                <p className="text-green-100 text-xs">Central Medical Records</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a href="#services" className="text-white hover:text-green-100 transition">Services</a>
              <a href="#features" className="text-white hover:text-green-100 transition">Features</a>
              <a href="#security" className="text-white hover:text-green-100 transition">Security</a>
              <a href="#contact" className="text-white hover:text-green-100 transition">Contact</a>
            </div>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="hidden md:block bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Get Started
              </button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-3">
              <a href="#services" className="block text-white hover:text-green-100">Services</a>
              <a href="#features" className="block text-white hover:text-green-100">Features</a>
              <a href="#security" className="block text-white hover:text-green-100">Security</a>
              <a href="#contact" className="block text-white hover:text-green-100">Contact</a>
              <button
                type="button"
                onClick={handleGetStarted}
                className="w-full bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Unified Medical Records for Better Healthcare
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Your complete health history, accessible to trusted healthcare providers across Nigeria. Secure, compliant, and designed for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-green-700 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Register Now
                </button>
                <button className="border-2 border-green-700 text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
                  Learn More
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-8 border-t-4 border-green-700">
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Database className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Centralized Records</h3>
                    <p className="text-gray-600 text-sm">All your medical history in one secure place</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Lock className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy Protected</h3>
                    <p className="text-gray-600 text-sm">GDPR, NDPA & HIPAA compliant protection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="w-6 h-6 text-green-700 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trusted Access</h3>
                    <p className="text-gray-600 text-sm">Control who sees your medical information</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who CMRS Serves</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed for seamless collaboration between patients, healthcare providers, and institutions
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            {['patients', 'providers', 'hospitals'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  activeTab === tab
                    ? 'bg-green-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid md:grid-cols-3 gap-8">
            {activeTab === 'patients' && (
              <>
                <TabCard 
                  icon={<Users className="w-8 h-8" />}
                  title="Access Your Records"
                  description="View your complete medical history, test results, and prescriptions from any device, anytime."
                />
                <TabCard 
                  icon={<Shield className="w-8 h-8" />}
                  title="Control Your Data"
                  description="Decide which doctors and hospitals can access your medical information with granular permissions."
                />
                <TabCard 
                  icon={<Database className="w-8 h-8" />}
                  title="NIN Verified"
                  description="Your records are securely linked to your National Identification Number for authenticity."
                />
              </>
            )}
            {activeTab === 'providers' && (
              <>
                <TabCard 
                  icon={<Database className="w-8 h-8" />}
                  title="Complete Patient History"
                  description="Access comprehensive medical records to make informed clinical decisions and avoid duplicate tests."
                />
                <TabCard 
                  icon={<CheckCircle className="w-8 h-8" />}
                  title="Faster Diagnosis"
                  description="Reference past treatments, allergies, and medications instantly for better patient assessment."
                />
                <TabCard 
                  icon={<Lock className="w-8 h-8" />}
                  title="HIPAA Compliant"
                  description="All data exchange follows international healthcare privacy standards and regulations."
                />
              </>
            )}
            {activeTab === 'hospitals' && (
              <>
                <TabCard 
                  icon={<Users className="w-8 h-8" />}
                  title="Interoperability"
                  description="Connect public and private hospitals on one unified platform for seamless record sharing."
                />
                <TabCard 
                  icon={<Database className="w-8 h-8" />}
                  title="Data Integration"
                  description="Push and pull patient records securely using standardized healthcare data protocols."
                />
                <TabCard 
                  icon={<Shield className="w-8 h-8" />}
                  title="Institutional Control"
                  description="Manage patient consent, audit trails, and regulatory compliance with institutional dashboards."
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Why Choose CMRS?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureItem 
              title="NIN-Based Verification"
              description="Unique identification using Nigeria's National Identification Number for secure patient authentication and record matching."
            />
            <FeatureItem 
              title="Real-Time Synchronization"
              description="Automatic updates across all connected hospitals and clinics whenever new medical records are added."
            />
            <FeatureItem 
              title="Multi-Platform Access"
              description="Accessible via web, mobile app, and desktop applications for healthcare providers on the go."
            />
            <FeatureItem 
              title="Advanced Search"
              description="Quickly find medical records, test results, prescriptions, and treatment history with intelligent filtering."
            />
            <FeatureItem 
              title="Audit Trails"
              description="Complete logging of who accessed what information and when for regulatory compliance and security."
            />
            <FeatureItem 
              title="Emergency Access"
              description="Authorized emergency personnel can access critical medical information when patients cannot authorize."
            />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Enterprise-Grade Security</h2>
              <p className="text-gray-700 mb-6">
                Your health data is among the most sensitive personal information. CMRS implements multiple layers of security to keep it safe.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>End-to-End Encryption:</strong> All data encrypted in transit and at rest</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>GDPR Compliant:</strong> Full GDPR compliance for international standards</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>NDPA Adherence:</strong> Nigeria Data Protection Act compliance</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>HIPAA Standards:</strong> Healthcare data privacy regulations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700"><strong>Regular Audits:</strong> Third-party security assessments and penetration testing</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-700 to-blue-600 rounded-lg p-8 text-white">
              <div className="space-y-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90">Data Protection</div>
                  <div className="text-2xl font-bold mt-1">256-bit AES</div>
                  <div className="text-xs opacity-75 mt-1">Encryption standard</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90">Access Control</div>
                  <div className="text-2xl font-bold mt-1">Role-Based</div>
                  <div className="text-xs opacity-75 mt-1">Granular permissions</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-sm opacity-90">Monitoring</div>
                  <div className="text-2xl font-bold mt-1">24/7</div>
                  <div className="text-xs opacity-75 mt-1">Real-time threat detection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-green-700 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Healthcare Records?</h2>
          <p className="text-lg mb-8 text-green-50">
            Join hospitals and healthcare providers across Nigeria building a better healthcare system
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={handleGetStarted}
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              Start Your Journey
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">CMRS</h3>
              <p className="text-sm">Unified medical records for better healthcare in Nigeria</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-6 mb-4 md:mb-0">
                <a href="tel:+2341234567890" className="flex items-center space-x-2 hover:text-white transition">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+234 (0) 123 456 7890</span>
                </a>
                <a href="mailto:support@cmrs.ng" className="flex items-center space-x-2 hover:text-white transition">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">support@cmrs.ng</span>
                </a>
              </div>
              <p className="text-sm">&copy; 2024 Central Medical Records Service. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TabCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition border-l-4 border-green-700">
      <div className="text-green-700 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-700">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
