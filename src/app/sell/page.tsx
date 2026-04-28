import Link from "next/link";
import { ArrowRight, CheckCircle2, Upload, Megaphone, HandCoins, Shield, Users, DollarSign, Clock, Star } from "lucide-react";

export default function SellLandingPage() {
  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Submit Your Car",
      description: "Upload photos and details about your Shelby. Our team reviews every listing to ensure quality and authenticity.",
    },
    {
      icon: Megaphone,
      step: "02",
      title: "We Promote It",
      description: "We push your listing to targeted Shelby buyers through our network, social channels, and 100+ email subscribers.",
    },
    {
      icon: HandCoins,
      step: "03",
      title: "You Get Offers",
      description: "Deal directly with serious buyers. No dealer games, no lowball tactics - just real offers from real enthusiasts.",
    },
  ];

  const benefits = [
    {
      icon: Users,
      title: "Nationwide Reach",
      description: "Your listing reaches Shelby buyers across all 50 states, not just local traffic.",
    },
    {
      icon: Shield,
      title: "Verified Buyers",
      description: "Every inquiry comes from a verified account. No spam, no tire kickers.",
    },
    {
      icon: DollarSign,
      title: "No Commission",
      description: "Zero transaction fees. You keep every dollar from your sale.",
    },
    {
      icon: Clock,
      title: "Fast Results",
      description: "Most sellers receive their first offer within 7-14 days of listing.",
    },
  ];

  const testimonials = [
    {
      name: "Marcus T.",
      location: "Detroit, MI",
      text: "Sold my 2020 GT500 in under 2 weeks. Got three serious offers and didn't have to deal with any dealer lowball tactics.",
      rating: 5,
    },
    {
      name: "David L.",
      location: "Phoenix, AZ",
      text: "Listed my Super Snake and had offers within days. No middleman, no hassle. Best experience I've had selling a car.",
      rating: 5,
    },
    {
      name: "Sarah K.",
      location: "Austin, TX",
      text: "As a first-time seller, the process was incredibly smooth. The team helped me price it right and I got top dollar.",
      rating: 5,
    },
  ];

  const pricingTiers = [
    {
      name: "Standard Listing",
      price: "$99",
      description: "Standard search grid visibility.",
      period: "one-time",
      features: ["Up to 20 High-Res Photos", "VIN Decoding", "Standard Placement"],
      cta: "Select",
      popular: false,
    },
    {
      name: "Homepage Featured",
      price: "$149",
      description: "Gets you on the homepage.",
      period: "one-time",
      features: ["Featured Badge", "Homepage Carousel Placement", "Priority Search Highlighting"],
      cta: "Select",
      popular: true,
    },
    {
      name: "Homepage + Google Ads",
      price: "$299",
      description: "Maximum exposure globally.",
      period: "one-time",
      features: ["Homepage Carousel Placement", "Dedicated Google Ads Campaign", "Social Media Spotlight"],
      cta: "Select",
      popular: false,
    },
  ];

  return (
    <div className="flex flex-col font-inter text-[#171a1f] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#0F172A] overflow-hidden">
        <img src="/images/96eb0d70-2020-ford-mustang-shelby-gt500-3.jpg" className="absolute inset-0 w-full h-full object-cover object-center opacity-40" alt="Hero" />
        <div className="relative max-w-[1440px] mx-auto px-5 md:px-12 py-24 md:py-32">
          <div className="inline-flex items-center px-4 py-1 bg-[#E31837]/20 border border-[#E31837]/30 rounded-full backdrop-blur-md mb-6">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Sell With Confidence</span>
          </div>
          
          <h1 className="text-white font-black text-3xl sm:text-5xl md:text-6xl lg:text-[64px] leading-tight tracking-tighter mb-4 drop-shadow-2xl break-words italic uppercase max-w-4xl">
            Sell Your Shelby The Right Way
          </h1>
          
          <p className="text-[#D1D5DB] font-outfit text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
            Skip the dealer games and lowball trade-in offers. List your Shelby on the premier marketplace built exclusively for Shelby enthusiasts and reach serious buyers nationwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sell/wizard" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#E31837] text-white font-bold rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">
              Start Your Listing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-[#dee1e6] py-10">
        <div className="max-w-[1440px] mx-auto px-5 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <span className="block text-3xl md:text-4xl font-black text-[#002D72]">100+</span>
            <span className="text-xs font-bold text-[#565d6d] uppercase tracking-wider">Active Buyers</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl md:text-4xl font-black text-[#002D72]">$1M+</span>
            <span className="text-xs font-bold text-[#565d6d] uppercase tracking-wider">Monthly Volume</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl md:text-4xl font-black text-[#002D72]">14</span>
            <span className="text-xs font-bold text-[#565d6d] uppercase tracking-wider">Avg Days to Sell</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl md:text-4xl font-black text-[#002D72]">0%</span>
            <span className="text-xs font-bold text-[#565d6d] uppercase tracking-wider">Commission Fees</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#fafafb] py-20 px-5 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E31837]/10 rounded-full mb-6">
              <span className="text-xs font-bold text-[#E31837] uppercase tracking-wider">Simple 3-Step Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">How It Works</h2>
            <p className="text-[#565d6d] text-lg max-w-2xl mx-auto">Selling your Shelby has never been easier. Three simple steps to connect with serious buyers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative bg-white rounded-2xl p-8 border border-[#dee1e6] shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-[#E31837]/10 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-[#E31837]" />
                </div>
                <span className="text-[#E31837] font-black text-xs tracking-wider mb-2 block">{step.step}</span>
                <h3 className="font-outfit font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-[#565d6d] text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/sell/wizard" className="inline-flex items-center gap-3 px-10 py-5 bg-[#E31837] text-white font-bold rounded-xl shadow-lg shadow-[#E31837]/20 hover:bg-[#c41530] transition-colors">
              Start Selling Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Sell With Us */}
      <section className="bg-white py-20 px-5 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#002D72]/10 rounded-full mb-6">
              <span className="text-xs font-bold text-[#002D72] uppercase tracking-wider">Why Choose Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Built for Shelby Sellers</h2>
            <p className="text-[#565d6d] text-lg max-w-2xl mx-auto">We understand the Shelby market better than anyone. Here&apos;s why sellers choose us.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#002D72]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-[#002D72]" />
                </div>
                <h3 className="font-outfit font-bold text-lg mb-3">{benefit.title}</h3>
                <p className="text-[#565d6d] text-sm leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[#fafafb] py-20 px-5 md:px-12 border-y border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#002D72]/10 rounded-full mb-6">
              <span className="text-xs font-bold text-[#002D72] uppercase tracking-wider">Transparent Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Listing Packages</h2>
            <p className="text-[#565d6d] text-lg max-w-2xl mx-auto">Choose the package that fits your needs. No hidden fees, no transaction commissions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div key={idx} className={`relative rounded-2xl p-8 border ${tier.popular ? 'border-[#E31837] shadow-lg shadow-[#E31837]/10' : 'border-[#dee1e6] shadow-sm'} flex flex-col`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#E31837] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Most Popular</div>
                )}
                <h3 className="font-outfit font-bold text-lg mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black">{tier.price}</span>
                  <span className="text-[#565d6d] text-sm">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-[#565d6d]">
                      <CheckCircle2 className="w-4 h-4 text-[#E31837] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/sell/wizard" className={`w-full py-3 rounded-md text-center text-sm font-bold transition-colors ${tier.popular ? 'bg-[#E31837] text-white hover:bg-[#c41530]' : 'bg-[#002D72] text-white hover:bg-[#001D4A]'}`}>
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Auto-scrolling */}
      <section className="bg-[#fafafb] py-16 md:py-20 overflow-hidden border-y border-[#dee1e6]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-12">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#E31837]/10 rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold text-[#E31837] uppercase tracking-wider">Testimonials</span></div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter mb-3 md:mb-4">What Sellers Say</h2>
            <p className="text-[#565d6d] text-sm md:text-lg max-w-2xl mx-auto">Real stories from real Shelby owners who sold through our platform.</p>
          </div>
        </div>
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-testimonials gap-4 md:gap-6 w-max">
            {[...testimonials, ...testimonials, ...testimonials].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 md:p-6 border border-[#dee1e6] shadow-sm flex flex-col w-[280px] md:w-[320px] shrink-0">
                <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">{[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#E31837] text-[#E31837]" />))}</div>
                <p className="text-[#565d6d] text-xs md:text-sm leading-relaxed mb-4 md:mb-6 flex-1">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-[#f3f4f6]">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-[#002D72]/10 rounded-full flex items-center justify-center"><span className="text-[#002D72] font-bold text-xs md:text-sm">{testimonial.name[0]}</span></div>
                  <div><span className="block text-xs md:text-sm font-bold text-[#171a1f]">{testimonial.name}</span><span className="block text-[10px] md:text-xs text-[#565d6d]">{testimonial.location}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#001530] py-24 overflow-hidden">
        <img src="/images/c5f4c-hi-tech-mustang-front.webp" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="CTA Background" />
        <div className="relative max-w-[1440px] mx-auto px-5 md:px-12 text-center">
          <h2 className="text-white font-outfit font-black text-3xl sm:text-5xl md:text-6xl leading-[0.95] uppercase tracking-tighter mb-6">
            Ready to Sell Your Shelby?
          </h2>
          <p className="text-[#9CA3AF] font-outfit text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join hundreds of Shelby owners who sold their vehicles faster and for more money through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell/wizard" className="inline-flex items-center justify-center gap-3 px-12 py-5 bg-[#E31837] text-white font-bold rounded-2xl shadow-2xl shadow-[#E31837]/30 hover:bg-[#c41530] transition-all">
              Start Your Listing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-12 py-5 bg-white/10 backdrop-blur-md text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
