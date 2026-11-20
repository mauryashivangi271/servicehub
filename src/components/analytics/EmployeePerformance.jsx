import { Users } from "lucide-react";

export default function EmployeePerformance({
  employees = [],
}) {
  return (
    <section className="bg-white border rounded-2xl p-5">

      <h2 className="flex items-center gap-2 text-xl font-bold">
        <Users className="text-indigo-600" />
        Employee Performance
      </h2>

      <p className="text-sm text-slate-500 mt-2 mb-5">
        Assigned and completed bookings
      </p>

      {employees.length === 0 ? (

        <p className="text-center text-slate-500 py-10">
          No employees available.
        </p>

      ) : (
        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="bg-slate-50">

              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Assigned</th>
                <th className="p-4">Completed</th>
                <th className="p-4">Completion Rate</th>
              </tr>

            </thead>

            <tbody>

              {employees.map((employee) => {
                const rate = Number(employee.assigned) > 0
                  ? Math.round(
                      employee.completed /
                      employee.assigned * 100
                    )
                  : 0;

                return (
                  <tr key={employee.id} className="border-b">

                    <td className="p-4 font-medium">
                      {employee.name}
                    </td>

                    <td className="p-4">
                      {employee.assigned}
                    </td>

                    <td className="p-4">
                      {employee.completed}
                    </td>

                    <td className="p-4 min-w-[150px]">

                      <div className="flex justify-between mb-2">

                        <span>{rate}%</span>

                      </div>

                      <div
                        className="bg-slate-100 h-2 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={rate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >

                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${rate}%` }}
                        />

                      </div>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      )}

    </section>
  );
}