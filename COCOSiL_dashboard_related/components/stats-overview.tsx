'use client';

import { DiagnosisStats } from '@/types/admin';
import { Users, Star, Heart, Brain } from 'lucide-react';

interface StatsOverviewProps {
  stats: DiagnosisStats | null;
  detailed?: boolean;
}

export default function StatsOverview({ stats, detailed = false }: StatsOverviewProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const overviewCards = [
    {
      title: '総診断数',
      value: stats.totalRecords,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: '平均満足度',
      value: `${stats.averageSatisfaction.toFixed(1)}/5.0`,
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      title: '平均診断時間',
      value: `${stats.averageDuration.toFixed(0)}分`,
      icon: Heart,
      color: 'bg-pink-500',
    },
    {
      title: 'アクティブ率',
      value: '95%',
      icon: Brain,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {detailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 性別分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">性別分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.genderDistribution).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    {gender === 'male' ? '男性' : gender === 'female' ? '女性' : '未回答'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalRecords) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 年齢分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">年齢分布</h3>
            <div className="space-y-3">
              {Object.entries(stats.ageGroups).map(([ageGroup, count]) => (
                <div key={ageGroup} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{ageGroup}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalRecords) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MBTI分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">MBTI分布（上位5位）</h3>
            <div className="space-y-3">
              {Object.entries(stats.mbtiDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([mbti, count]) => (
                  <div key={mbti} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{mbti}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${(count / stats.totalRecords) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 動物占い分布 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">動物占い分布（上位5位）</h3>
            <div className="space-y-3">
              {Object.entries(stats.animalDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([animal, count]) => (
                  <div key={animal} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{animal}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${(count / stats.totalRecords) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}