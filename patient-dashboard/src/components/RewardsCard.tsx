"use client";

import { CurrencyDollarIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function RewardsCard() {
    return (
        <div className="bg-white rounded-lg shadow-md border border-vintage-200">
            <div className="border-b border-vintage-200 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-alfa-slab text-vintage-900">Health Rewards</h2>
                        <p className="text-sm text-vintage-900/70">Earn rewards for managing your health</p>
                    </div>
                    <div className="flex items-center gap-2 bg-brick-500 px-4 py-2 rounded-lg">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                        <span className="font-bold text-white">$120 Earned</span>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Current Challenge */}
                <div className="bg-vintage-50 rounded-lg p-4 border border-vintage-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-vintage-900">Current Challenge</h3>
                        <span className="text-sm font-medium text-brick-600">7 days left</span>
                    </div>
                    <p className="text-sm text-vintage-900/70 mb-4">
                        Log your glucose levels daily for 30 days
                    </p>
                    <div className="w-full bg-vintage-200 rounded-full h-2">
                        <div className="bg-brick-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs font-medium">
                        <span className="text-vintage-900">23/30 days</span>
                        <span className="text-brick-600">Reward: $50</span>
                    </div>
                </div>

                {/* Available Rewards */}
                <div className="space-y-3">
                    <h3 className="font-bold text-vintage-900">Available Rewards</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-vintage-50 border border-vintage-200 rounded-lg hover:bg-vintage-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brick-500 flex items-center justify-center">
                                <TrophyIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-vintage-900">Maintain A1C below 7.0</p>
                                <p className="text-sm text-vintage-900/70">3 months challenge</p>
                            </div>
                        </div>
                        <span className="font-bold text-brick-600">$150</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-vintage-50 border border-vintage-200 rounded-lg hover:bg-vintage-100 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brick-500 flex items-center justify-center">
                                <TrophyIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-vintage-900">Weekly Check-in Streak</p>
                                <p className="text-sm text-vintage-900/70">Log readings 7 days in a row</p>
                            </div>
                        </div>
                        <span className="font-bold text-brick-600">$25</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 