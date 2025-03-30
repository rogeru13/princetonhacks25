'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { ArrowRightOnRectangleIcon, HeartIcon, UserGroupIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import DailyMetricsCard from '@/components/DailyMetricsCard';
import LatestGlucoseCard from '@/components/LatestGlucoseCard';
import StatsCard from '@/components/StatsCard';
import HealthCheckCalendar from '@/components/HealthCheckCalendar';
import RewardsCard from '@/components/RewardsCard';

export default function Home() {
    const { user } = useUser();

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-vintage-900 to-vintage-800 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
                
                {/* Gradient Orbs */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-brick-500/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-vintage-500/20 rounded-full blur-[120px]" />
                
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <h1 className="text-5xl lg:text-7xl font-alfa-slab text-white mb-6 leading-tight">
                                A <span className="text-brick-500">Manzana</span> A Day,
                                <br />
                                Keeps the Doctor in Play
                            </h1>
                            
                            <p className="text-lg text-vintage-100/70 mb-8 max-w-2xl mx-auto">
                                Join Manzana in revolutionizing healthcare through prevention. We're not just another health platform – 
                                we're your daily companion in the journey to better health, revolutionizing western medicine.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-brick-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <HeartIcon className="w-6 h-6 text-brick-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Preventative Focus</h3>
                                <p className="text-vintage-100/70">
                                    Shift from reactive to proactive healthcare with our AI-powered risk analysis and daily wellness tracking.
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-brick-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <UserGroupIcon className="w-6 h-6 text-brick-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Doctor-Patient Bond</h3>
                                <p className="text-vintage-100/70">
                                    Strengthen the connection with your healthcare providers through meaningful, data-driven interactions.
                                </p>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-brick-500/10 rounded-xl flex items-center justify-center mb-4">
                                    <SparklesIcon className="w-6 h-6 text-brick-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Gamified Wellness</h3>
                                <p className="text-vintage-100/70">
                                    Transform your health journey into an engaging experience with rewards for preventative actions.
                                </p>
                            </div>
                        </div>

                        {/* Add Dashboard Preview */}
                        <div className="relative mx-auto max-w-5xl mb-16 px-4">
                            <div className="relative z-10 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-2xl">
                                <Image
                                    src="/page.png"
                                    alt="Manzana Dashboard Preview"
                                    width={1200}
                                    height={675}
                                    className="rounded-lg w-full h-auto shadow-2xl"
                                    priority
                                />
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brick-500/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-vintage-500/20 rounded-full blur-2xl" />
                        </div>

                        {/* CTA Section */}
                        <div className="text-center">
                            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/api/auth/login"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brick-500 text-white rounded-xl hover:bg-brick-600 transition-all duration-200 transform hover:scale-105 shadow-xl shadow-brick-500/25"
                                >
                                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                    <span className="font-medium">Start Your Prevention Journey</span>
                                </a>
                            </div>

                            {/* Mission Statement and Logo */}
                            <div className="mt-16 max-w-3xl mx-auto text-center">
                                <blockquote className="text-lg text-black italic mb-12">
                                    "We're not just treating symptoms – we're revolutionizing healthcare by making prevention accessible, 
                                    engaging, and connected. One apple at a time."
                                </blockquote>
                                <div className="mt-4 text-black">— Manzana Team</div>
                                
                                {/* Logo */}
                                <div className="flex justify-center">
                                    <Image
                                        src="/manzana.png"
                                        alt="Manzana Logo"
                                        width={150}
                                        height={150}
                                        className="w-32 h-32 object-contain opacity-80"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 p-4 md:p-6 bg-cream">
                <div className="space-y-4 md:space-y-6 max-w-lg mx-auto md:max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                        <LatestGlucoseCard />
                        <StatsCard
                            title="Latest HbA1c"
                            value="6.2%"
                            icon="📊"
                            trend="Good"
                        />
                        <StatsCard
                            title="Next Check-up"
                            value="3 days"
                            icon="📅"
                            trend="Upcoming"
                        />
                        <StatsCard
                            title="Rewards Balance"
                            value="$120"
                            icon="🏆"
                            trend="+$25 this week"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <DailyMetricsCard />
                            <HealthCheckCalendar />
                        </div>
                        <RewardsCard />
                    </div>
                </div>
            </main>
        </div>
    );
}
