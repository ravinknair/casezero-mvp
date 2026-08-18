interface CaseMetadataProps {
  confidence: number;
  sources: number;
  activity: number;
  status: string;
}

export function CaseMetadata({ confidence, sources, activity, status }: CaseMetadataProps) {
  return (
    <div className="mt-4 grid gap-3 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Confidence</p>
        <p className="text-lg font-bold text-gray-900">{confidence.toFixed(0)}%</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Evidence sources</p>
        <p className="text-lg font-bold text-gray-900">{sources}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Activities</p>
        <p className="text-lg font-bold text-gray-900">{activity}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
        <p className="text-lg font-bold capitalize text-gray-900">{status}</p>
      </div>
    </div>
  );
}
