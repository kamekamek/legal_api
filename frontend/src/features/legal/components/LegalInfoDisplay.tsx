import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLegalInfo } from '../../../services/legalService';

interface LegalInfoDisplayProps {
  projectId: string;
}

const LegalInfoDisplay: React.FC<LegalInfoDisplayProps> = ({ projectId }) => {
  const { data: legalInfo, isLoading } = useQuery({
    queryKey: ['legalInfo', projectId],
    queryFn: () => fetchLegalInfo(projectId),
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-6">法令情報</h2>
      
      {/* 用途地域情報 */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">用途地域情報</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-600">用途地域</label>
            <p className="mt-1 font-medium">{legalInfo?.zoning_info.zone_type}</p>
          </div>
          <div>
            <label className="text-gray-600">防火地域</label>
            <p className="mt-1 font-medium">{legalInfo?.zoning_info.fire_prevention}</p>
          </div>
          <div>
            <label className="text-gray-600">建蔽率</label>
            <p className="mt-1 font-medium">{legalInfo?.zoning_info.coverage_ratio}%</p>
          </div>
          <div>
            <label className="text-gray-600">容積率</label>
            <p className="mt-1 font-medium">{legalInfo?.zoning_info.floor_area_ratio}%</p>
          </div>
          <div>
            <label className="text-gray-600">高度地区</label>
            <p className="mt-1 font-medium">{legalInfo?.zoning_info.height_district}</p>
          </div>
          <div>
            <label className="text-gray-600">区域区分</label>
            <p className="mt-1 font-medium">{legalInfo?.zoning_info.area_classification}</p>
          </div>
        </div>
      </div>

      {/* 建築制限情報 */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">建築制限情報</h3>
        <div className="space-y-4">
          <div>
            <label className="text-gray-600">建築基準法48条関連</label>
            <div className="mt-2 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">建築可能な用途</h4>
              <ul className="list-disc list-inside space-y-1">
                {legalInfo?.building_restrictions.building_standard_law_48.allowed_uses.map((use: string) => (
                  <li key={use}>{use}</li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <label className="text-gray-600">法別表第2</label>
            <p className="mt-1 font-medium">
              {legalInfo?.building_restrictions.law_appendix_2.category}
            </p>
          </div>
        </div>
      </div>

      {/* 条例・告示情報 */}
      <div>
        <h3 className="text-lg font-medium mb-4">条例・告示情報</h3>
        <div className="space-y-4">
          {legalInfo?.regulations.notifications.map((notification: any) => (
            <div key={notification.notification_id} className="p-4 bg-gray-50 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{notification.notification_id}</p>
                  <p className="text-sm text-gray-600">
                    施行日: {new Date(notification.effective_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-gray-700">{notification.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalInfoDisplay; 