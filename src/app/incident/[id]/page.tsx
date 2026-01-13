import { notFound } from 'next/navigation';
import { getIncidentById } from '@/lib/db';
import { IncidentDetailClient } from '@/components/IncidentDetailClient';

export const revalidate = 0;

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const incident = await getIncidentById(params.id);

  if (!incident) {
    notFound();
  }

  return <IncidentDetailClient incident={incident} />;
}
