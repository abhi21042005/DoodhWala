// global loading state for app router pages
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-green-deep animate-spin mb-4" />
      <p className="text-sm font-medium text-gray-600 font-serif">
        Loading DoodhWala...
      </p>
    </div>
  );
}
