export default function TableSkeleton({ filas = 8 }) {
  return (
    <>
      {Array.from({ length: filas }, (_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 w-10 rounded bg-slate-200" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-16 rounded bg-slate-200" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-20 rounded-full bg-slate-200" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-20 rounded-full bg-slate-200" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-14 rounded bg-slate-200" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-20 rounded bg-slate-200" />
          </td>
          <td className="px-4 py-3">
            <div className="mx-auto h-7 w-28 rounded-lg bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
}
