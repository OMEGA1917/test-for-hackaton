import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Building2, Users, ShieldCheck, TrendingUp, Image as ImageIcon, Inbox, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const HERO_IMAGE = 'https://images.pexels.com/photos/16559813/pexels-photo-16559813.jpeg?auto=compress&cs=tinysrgb&w=1600';

const FEATURED_IMAGES = [
  'https://images.pexels.com/photos/16951958/pexels-photo-16951958.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/5102100/pexels-photo-5102100.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3229969/pexels-photo-3229969.png?auto=compress&cs=tinysrgb&w=800',
];

const POPULAR_LOCATIONS = [
  { city: 'New York', country: 'United States', count: 142 },
  { city: 'London', country: 'United Kingdom', count: 87 },
  { city: 'Mumbai', country: 'India', count: 96 },
  { city: 'Dubai', country: 'United Arab Emirates', count: 53 },
  { city: 'Singapore', country: 'Singapore', count: 38 },
  { city: 'Toronto', country: 'Canada', count: 41 },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [searchLocation, setSearchLocation] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set('q', searchLocation);
    if (searchDate) params.set('available', searchDate);
    navigate(`/billboards?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Billboard advertising in a city"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
        </div>

        <div className="container-page relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              Premium Outdoor Advertising Marketplace
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Find the right billboard.
              <br />
              Reach the right audience.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-200">
              Discover premium outdoor advertising spaces in high-impact locations. Compare, book, and launch your campaign with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={() => navigate('/billboards')}>
                Explore Billboards
                <ArrowRight size={18} />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/signup')} className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50">
                List Your Billboard
              </Button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative container-page pb-8">
          <Card className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-500">Location</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    placeholder="City or country"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-ink-500">Available From</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full rounded-lg border border-ink-300 bg-white py-2.5 pl-10 pr-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button size="md" className="w-full sm:w-auto" onClick={handleSearch}>
                  <Search size={16} />
                  Search
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Featured Billboards</h2>
            <p className="mt-2 text-ink-500">High-impact advertising spaces in prime locations</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/billboards')} className="hidden sm:flex">
            View All
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_IMAGES.map((img, i) => (
            <Card key={i} hover className="overflow-hidden cursor-pointer" onClick={() => navigate('/billboards')}>
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-200">
                <img src={img} alt="Featured billboard" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    Featured
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-ink-900">
                  {['Times Square Digital Display', 'Highway Gateway Billboard', 'Downtown Skyscraper Panel'][i]}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin size={14} />
                  {['New York, United States', 'Bangkok, Thailand', 'New York, United States'][i]}
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-ink-900">{['$2,500', '$800', '$1,800'][i]}</p>
                    <p className="text-xs text-ink-400">Per Month</p>
                  </div>
                  <span className="text-sm font-medium text-brand-600">View Details</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular locations */}
      <section className="border-y border-ink-200 bg-white py-20">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Popular Locations</h2>
          <p className="mt-2 text-ink-500">Explore billboards in high-demand markets</p>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {POPULAR_LOCATIONS.map((loc) => (
              <Card
                key={loc.city}
                hover
                className="cursor-pointer p-5 text-center"
                onClick={() => navigate(`/billboards?q=${encodeURIComponent(loc.city)}`)}
              >
                <MapPin size={24} className="mx-auto text-brand-500" />
                <p className="mt-3 font-semibold text-ink-900">{loc.city}</p>
                <p className="text-xs text-ink-400">{loc.country}</p>
                <p className="mt-2 text-xs font-medium text-brand-600">{loc.count} billboards</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-20">
        <h2 className="text-center text-2xl font-bold text-ink-900 sm:text-3xl">How BoardSpot Works</h2>
        <p className="mt-2 text-center text-ink-500">A simple marketplace for outdoor advertising</p>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* For advertisers */}
          <Card className="p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Users size={20} />
              </div>
              <h3 className="text-xl font-semibold text-ink-900">For Advertisers</h3>
            </div>
            <div className="mt-6 space-y-5">
              {[
                { icon: <Search size={18} />, title: 'Search', desc: 'Find billboards by location, type, price, and availability.' },
                { icon: <TrendingUp size={18} />, title: 'Compare', desc: 'Compare dimensions, lighting, pricing, and locations side by side.' },
                { icon: <Inbox size={18} />, title: 'Request', desc: 'Submit booking requests to owners and track their status.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{step.title}</p>
                    <p className="text-sm text-ink-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/signup')}>
              Get Started as Advertiser
            </Button>
          </Card>

          {/* For owners */}
          <Card className="p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Building2 size={20} />
              </div>
              <h3 className="text-xl font-semibold text-ink-900">For Billboard Owners</h3>
            </div>
            <div className="mt-6 space-y-5">
              {[
                { icon: <ImageIcon size={18} />, title: 'List', desc: 'Add your billboard with photos, dimensions, and pricing in minutes.' },
                { icon: <Inbox size={18} />, title: 'Receive Requests', desc: 'Get booking requests from advertisers and review them in your dashboard.' },
                { icon: <DollarSign size={18} />, title: 'Earn', desc: 'Accept or reject requests and start earning from your ad space.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-medium text-ink-900">{step.title}</p>
                    <p className="text-sm text-ink-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full" onClick={() => navigate('/signup')}>
              Get Started as Owner
            </Button>
          </Card>
        </div>
      </section>

      {/* Trust section */}
      <section className="border-y border-ink-200 bg-white py-20">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { icon: <ShieldCheck size={28} />, title: 'Verified Listings', desc: 'Every billboard listing is owner-managed with real location data and photos.' },
              { icon: <MapPin size={28} />, title: 'Location-First', desc: 'Find billboards by city, country, or specific coordinates with interactive maps.' },
              { icon: <TrendingUp size={28} />, title: 'Transparent Pricing', desc: 'See pricing upfront in local currency. No hidden fees, no surprises.' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-20">
        <Card className="overflow-hidden bg-ink-950">
          <div className="relative px-8 py-16 text-center sm:px-16 sm:py-20">
            <div className="absolute inset-0 opacity-10">
              <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to find your billboard?
              </h2>
              <p className="mt-3 text-ink-300">
                Join BoardSpot today and connect with premium outdoor advertising spaces.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => navigate('/billboards')}>
                  Explore Billboards
                  <ArrowRight size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/signup')}
                  className="border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50"
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
