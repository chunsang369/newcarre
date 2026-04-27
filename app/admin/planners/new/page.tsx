import PlannerForm from "../PlannerForm";

export default function NewPlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">플래너 등록</h1>
        <p className="text-slate-500 text-sm mt-1">하이카즈 매니저(플래너)를 추가합니다.</p>
      </div>
      <PlannerForm />
    </div>
  );
}
