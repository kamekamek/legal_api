import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProjectById } from '../services/projectService';
import LegalInfoDisplay from '../features/legal/components/LegalInfoDisplay';
import ZoneSearchButton from '../features/legal/components/ZoneSearchButton';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectById(id as string),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">エラーが発生しました。再度お試しください。</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{project?.name}</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            編集
          </button>
          <ZoneSearchButton projectId={id as string} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 基本情報 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-600">所在地</label>
              <p className="mt-1">{project?.location}</p>
            </div>
            <div>
              <label className="text-gray-600">規模</label>
              <p className="mt-1">{project?.scale}</p>
            </div>
            <div>
              <label className="text-gray-600">用途</label>
              <p className="mt-1">{project?.usage_type}</p>
            </div>
            <div>
              <label className="text-gray-600">ステータス</label>
              <p className="mt-1">{project?.status}</p>
            </div>
          </div>
        </div>

        {/* 法令情報 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <LegalInfoDisplay projectId={id as string} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 