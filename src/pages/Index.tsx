
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { 
  Calculator, 
  Camera, 
  DollarSign, 
  Tractor, 
  Package, 
  BarChart3, 
  Users, 
  Award,
  Star,
  ArrowRight,
  Leaf,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';

const Index = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "Farmer",
      location: "Punjab",
      content: "Smart Farm India has revolutionized my farming practices. The disease detection feature saved my entire wheat crop last season!",
      rating: 5,
      image: "/design-assets/hero_1.jpg"
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Organic Farmer",
      location: "Karnataka",
      content: "The cost planning tools helped me optimize my budget and increase profits by 40%. Highly recommended for all farmers!",
      rating: 5,
      image: "/design-assets/hero_2.jpg"
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Equipment Owner",
      location: "Gujarat",
      content: "As an equipment owner, this platform has helped me connect with more farmers and increase my rental business significantly.",
      rating: 5,
      image: "/design-assets/hero_3.jpg"
    }
  ];

  // Features data with navigation and background images
  const features = [
    {
      icon: Calculator,
      title: "GPS Area Calculator",
      description: "Calculate your farm area accurately using GPS technology and interactive maps.",
      color: "text-white",
      bgColor: "bg-blue-50",
      bgImage: "/design-assets/img_sq_1.jpg",
      href: "/calculator",
      allowedRoles: ["farmer"]
    },
    {
      icon: Camera,
      title: "AI Disease Detection",
      description: "Detect crop diseases early using advanced AI technology and image recognition.",
      color: "text-white",
      bgColor: "bg-green-50",
      bgImage: "/design-assets/img_sq_3.jpg",
      href: "/disease",
      allowedRoles: ["farmer"]
    },
    {
      icon: DollarSign,
      title: "Cost Planning",
      description: "Plan your farming budget and track expenses with detailed cost analysis tools.",
      color: "text-white",
      bgColor: "bg-yellow-50",
      bgImage: "/design-assets/img_sq_4.jpg",
      href: "/cost-planning",
      allowedRoles: ["farmer"]
    },
    {
      icon: Tractor,
      title: "Equipment Rental",
      description: "Rent tractors and farm equipment from verified owners in your area.",
      color: "text-white",
      bgColor: "bg-purple-50",
      bgImage: "/design-assets/img_sq_5.jpg",
      href: "/equipment-rental",
      allowedRoles: ["farmer", "owner"]
    },
    {
      icon: Package,
      title: "Farm Supply",
      description: "Connect with reliable suppliers for seeds, fertilizers, and farming supplies.",
      color: "text-white",
      bgColor: "bg-red-50",
      bgImage: "/design-assets/img_sq_6.jpg",
      href: "/farm-supply",
      allowedRoles: ["farmer", "owner", "supplier"]
    },
    {
      icon: BarChart3,
      title: "Market Intelligence",
      description: "Get real-time crop prices, market trends, and weather forecasts.",
      color: "text-white",
      bgColor: "bg-indigo-50",
      bgImage: "/design-assets/img_sq_8.jpg",
      href: "/market-intelligence",
      allowedRoles: ["farmer", "owner", "supplier"]
    }
  ];

  // Filter features by user role
  const role = user?.role || 'farmer';
  const visibleFeatures = features.filter((f) =>
    !f.allowedRoles || f.allowedRoles.includes(role)
  );

  // Statistics data
  const stats = [
    { number: "50,000+", label: "Active Farmers", icon: Users },
    { number: "₹2.5Cr+", label: "Equipment Rentals", icon: Tractor },
    { number: "95%", label: "Accuracy Rate", icon: Award },
    { number: "24/7", label: "Support Available", icon: Clock }
  ];

  const handleFeatureClick = (href: string) => {
    navigate(href);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16" style={{ backgroundImage: 'url(/Backgrounds/green-background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/30">
                  <Leaf className="w-4 h-4 mr-2" />
                  Digital Agriculture Solutions
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Smart Farming for a
                  <span className="text-green-300"> Better Tomorrow</span>
                </h1>
                <p className="text-xl text-white/90 leading-relaxed">
                  Empower your farming with cutting-edge technology. From AI-powered disease detection 
                  to GPS area calculation, we provide all the tools you need for modern agriculture.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                  onClick={() => {
                    const featuresSection = document.getElementById('features-section');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-white rounded-full border-2 border-white/50"></div>
                    ))}
                  </div>
                  <span className="text-sm text-white/90">50,000+ farmers trust us</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                  ))}
                  <span className="text-sm text-white/90 ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/design-assets/hero_1.jpg" 
                  alt="Smart Farming" 
                  className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-green-600 rounded-full opacity-20"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Farming
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite of tools and services is designed to help farmers 
              increase productivity, reduce costs, and make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 overflow-hidden relative h-80"
                onClick={() => handleFeatureClick(feature.href)}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-500"
                  style={{ 
                    backgroundImage: `url(${feature.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300"></div>
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between p-6">
                  <div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors mb-2">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center text-white font-medium group-hover:text-green-300 transition-colors">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Why Choose Smart Farm India?
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  We combine cutting-edge technology with deep agricultural expertise 
                  to provide solutions that actually work in the real world.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted by 50,000+ Farmers</h3>
                    <p className="text-gray-600">Join thousands of farmers who have already transformed their farming practices with our platform.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Proven Results</h3>
                    <p className="text-gray-600">Our users report an average 40% increase in productivity and 30% reduction in costs.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Award-Winning Technology</h3>
                    <p className="text-gray-600">Recognized by leading agricultural institutions for innovation and impact.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="/design-assets/hero_2.jpg" 
                alt="Why Choose Us" 
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">95%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Farmers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what farmers across India 
              have to say about their experience with Smart Farm India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

            {/* CTA Section */}
      <section className="py-20 relative" style={{ backgroundImage: 'url(/Backgrounds/karsten-wurth-UbGYPMbMYP8-unsplash.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of farmers who are already using Smart Farm India 
              to increase their productivity and profits.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
