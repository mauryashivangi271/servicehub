
import {
  Search,
  CalendarCheck,
  ShieldCheck
} from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Find a Service",
    description: "Search for the professional you need."
  },
  {
    icon: CalendarCheck,
    title: "Book a Professional",
    description: "Choose your preferred date and time."
  },
  {
    icon: ShieldCheck,
    title: "Get Service",
    description: "Track your request and confirm the agreed price before work."
  }
];

function HowItWorks() {
  return (
    <section id="how" className="bg-slate-100 py-5 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold">
            How ServiceHub Works
          </h2>

          <p className="text-slate-500 mt-3">
            Book local services in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="bg-white p-5 rounded-xl border border-slate-200 text-center hover:shadow-lg transition"
              >
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={30} className="text-blue-600" />
                </div>

                <span className="text-sm font-semibold text-blue-600">
                  STEP {index + 1}
                </span>

                <h3 className="text-xl font-semibold mt-3 mb-3">
                  {step.title}
                </h3>

                <p className="text-slate-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default HowItWorks;
