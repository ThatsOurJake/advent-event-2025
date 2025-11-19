import Link from "next/link";

export const LocationClosed = () => {
  return (
    <div className="space-y-2 w-3/4 mx-auto bg-white border rounded p-2">
      <img
        src="/static/workshop-closed.png"
        aria-label="Image of the location being closed"
        className="w-3/4 border-2 rounded mx-auto"
      />
      <p className="font-bold text-center">
        This location is not accessible today!
      </p>
      <div className="text-center py-2">
        <Link
          href="/"
          className="text-sm text-purple-600 px-2 py-1 border bg-purple-50 rounded cursor-pointer hover:underline"
        >
          Back to the main screen
        </Link>
      </div>
    </div>
  );
};
