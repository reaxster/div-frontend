import numeral from "numeral";

export default function MaxPotentialBanner({
  totalMax,
}: {
  totalMax: number | null;
}) {
  if (totalMax == null || !Number.isFinite(totalMax)) return null;

  return (
    <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-4">
      <p className="text-sm text-blue-900">
        You could make up to{" "}
        <span className="font-bold">{numeral(totalMax).format("0.00%")}</span>{" "}
        in the next 5 business days.
      </p>
    </div>
  );
}
